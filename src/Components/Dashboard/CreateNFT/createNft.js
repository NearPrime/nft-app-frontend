import axios from "axios";
import { nanoid } from "nanoid";
import React, { useState, useEffect } from "react";
import { Modal, ProgressBar } from "react-bootstrap";
import { AiOutlinePlus } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import fileHelper from "../../../Services/fileHelper";
import { API_BASE_URL } from "../../../Utils/config";
import { isEmpty, isTextEmpty, mapNftDetails } from "../../../Utils/utils";
import styles from "./createNft.module.css";
import LoaderIcon from '../../Generic/AppLoader';

const audioRegex = /(audio)(\/\w+)+/g;
const videoRegex = /(video)(\/\w+)+/g;

const allowedUploadCount = 1;
const requiredFileExtensions = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".mp4",
  ".mp3",
  ".webp",
];
const requiredFileExtensionsDescription = `${requiredFileExtensions
  .map((extension) => extension.substring(1).toUpperCase())
  .join(", ")
  .replace(/, ([^,]*)$/, ' or $1')
}`;

const nftDefaultProperties = {
  attr_name: "",
  attr_value: "",
  id: nanoid()
}

const nftDetailDefaultValue = {
  title: "",
  description: "",
  category: "Digital Arts",
}

function CreateNft(props) {
  const navigate = useNavigate();
  const { transactionId } = props;

  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileType, setSelectedFileType] = useState("image");
  const nfts = useSelector((state) => state.home__allnft.nfts);

  const [loading, setLoading] = useState(false);
  const [corruptedFile, setCorruptedFile] = useState(false);
  const [createNftResponse, setCreateNftResponse] = useState({
    name: "",
  });
  const { user } = useSelector((state) => state.authReducer);
  const { adTracker } = useSelector((state) => state.nftReducer);

  // getting all NFT detail

  const [details, setDetails] = useState(nftDetailDefaultValue);

  const [formValues, setFormValues] = useState([nftDefaultProperties]);
  const [formValuesError, setFormValuesError] = useState(false);

  useEffect(() => 0, [selectedFileType]);

  const formInfo = {
    selectedFile,
    ...details,
    ...formValues,
  };

  const handleChange = (index, clikedInput) => (e) => {
    if (formValues.length > 1) {
      if (formValues.every(item => !isTextEmpty(item.attr_value) && !isTextEmpty(item.attr_name))) {
        setFormValuesError(false)
      } else if (!formValuesError) {
        setFormValuesError(true)
      }
    }
    formValues[index] = {
      ...formValues[index],
      [`${clikedInput}`]: e.target.value,
    };

    setFormValues([...formValues]);
  };

  const addFormFields = () => {
    if (formValues.every(item => !isTextEmpty(item.attr_value) && !isTextEmpty(item.attr_name))) {
      setFormValues([
        ...formValues,
        {
          attr_name: "",
          attr_value: "",
          id: nanoid()
        },
      ]);
      setFormValuesError(false);
    } else {
      setFormValuesError(true);
    }
  };

  const dispatch = useDispatch();

  const openNftDetail = () => {
    dispatch({
      type: "nft__detail",
      payload: mapNftDetails(createNftResponse),
    });
    navigate(`/nft/${createNftResponse.nft_id}`);
  };

  const removeFormFields = (i) => {
    const newFormValues = [...formValues];
    newFormValues.splice(i, 1);
    setFormValues(newFormValues);
  };

  // Defined in reducer function
  const createnft__popup = useSelector((state) => state.createnft__popup);

  const inputEvent = (e) => {
    const { name, value } = e.target;
    setDetails((preValue) => ({
      ...preValue,
      [name]: value,
    }));
  };

  const sendNftModal = () => {
    dispatch({ type: "sendnft__open" });
    dispatch({ type: "handleTooltipClick__close" });
    window.dataLayer.push({
      event: "event",
      eventProps: {
        category: "Menu",
        action: "Send NFT Modal Opened",
        label: "Menu",
        value: "Menu",
      },
    });
  };
  // Rest Of the Modals
  const [nftForm, setNftForm] = useState(false);
  const [nftPreview, setNftPreview] = useState(false);
  const [nftMint, setNftMint] = useState(false);

  const handleNftForm = () => {
    if (selectedFile) {
      dispatch({ type: "createnft__close" });
      setNftForm(true);
      setNftPreview(false);
      setNftMint(false);
    } else {
      toast.error("File Cannot Be Empty");
    }
  };
  const handleNftPreview = async () => {
    if (isEmpty(details.title)) {
      toast.error("Please enter the title");
    } else if (details.title.length > 72) {
      toast.error("Title character length should be less than 72");
    } else if (isEmpty(details.description)) {
      toast.error("Please enter the description");
    } else if (details.description.length > 500) {
      toast.error("Description character length should be less than 500");
    } else {
      dispatch({ type: "createnft__close" });
      setNftForm(false);
      setNftPreview(true);
      setNftMint(false);
    }
  };

  const trackConversion = async (user, transactionId, details) => {
    const requestBody = {
      transaction_id: transactionId,
      userWallet: user?.user_id,
      details,
    };

    const conversionURL = "https://fcnefunrz6.execute-api.us-east-1.amazonaws.com/test/conversion";
    return axios.post(
      conversionURL,
      // TODO: Populate conversionURL with the production
      // version of the endpoint, something like below:
      // `${API_BASE_URL}/api/v1/conversion`,
      requestBody
    );
  };

  const mineNft = async (type) => {
    setLoading(true);
    const nftDetail = { ...details };
    const properties = [...formValues]
      .filter(item => item.attr_name !== "")
      .map((item) => {
        delete item.id
        return item;
      });
    nftDetail.attributes = properties;
    nftDetail.owner_id = user.user_id;
    nftDetail.tracker = adTracker;

    if (type === "mint") {
      nftDetail.action_type = "mine";
    }

    const nftData = new FormData();
    nftData.append("file", selectedFile);
    nftData.append("data", JSON.stringify(nftDetail));

    axios
      .post(`${API_BASE_URL}/nfts`, nftData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        dispatch({
          type: "current_selected_nft",
          payload: response.data?.data,
        });
        setCreateNftResponse(response.data?.data);

        toast.success(
          `NFT ${details.title} was successfully ${
            type === "mint" ? "minted" : "created"
          }.`
        );

        axios
          .get(`${API_BASE_URL}/nfts/list?owner_id=${user?.user_id}`)
          .then((response) => {
            const tempNfts = response.data.data;
            dispatch({ type: "update_nfts", payload: tempNfts });
          });

        dispatch({ type: "createnft__close" });
        setNftForm(false);
        setNftPreview(false);

        // reset create nft form
        setDetails({
          ...details,
          title: "",
          description: "",
        });
        setSelectedFile("");
        setFormValues([nftDefaultProperties]);

        if (type === "gift") {
          sendNftModal();

          if (transactionId) {
            trackConversion(user, transactionId, details);
          }
        }

        if (type === "mint") {
          setNftMint(true);
        }
      })
      .catch((error) => {
        if (error?.response?.data) {
          toast.error(error.response.data.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const goBack = (modalName) => {
    setCorruptedFile(false);

    if (modalName === "initalForm") {
      dispatch({ type: "createnft__open" });
      setNftForm(false);
      setNftPreview(false);
      setNftMint(false);
    } else if (modalName === "nftForm") {
      dispatch({ type: "createnft__close" });
      setNftForm(true);
      setNftPreview(false);
      setNftMint(false);
    }
  };

  const handleCorruptedFile = () => {
    toast.error("Selected file does not exist.");
    setCorruptedFile(true);
  };

  /**
   * Saves new files in state, or shows error modal if error in upload
   * @param {array} files array of files returned from upload event
   */
  async function handleNewFileUpload(files) {
    const errorObject = fileHelper.validateFilesForUpload(
      files,
      allowedUploadCount,
      requiredFileExtensions
    );

    if (errorObject) {
      toast.error(errorObject.message);
    } else {
      const newFile = files[0];
      setSelectedFile(newFile);
      if (videoRegex.test(newFile.type)) {
        setSelectedFileType("video");
      } else if (audioRegex.test(newFile.type)) {
        setSelectedFileType("audio");
      } else {
        setSelectedFileType("image");
      }

      setCorruptedFile(false);
    }
  }

  const handleDragableItem = (actionType) => (e) => {
    switch (actionType) {
      case "placed":
        e.preventDefault();
        e.stopPropagation();
        handleNewFileUpload(e.dataTransfer.files);
        break;
      case "over":
        e.preventDefault();
        e.stopPropagation();
        break
      default:
        break;
    }
  }

  if (loading) return <LoaderIcon />
  return (
    <>
      {/* Initial Modal  */}
      <Modal
        className={`${styles.initial__nft__modal} ${styles.nft__mobile__modal} initial__modal`}
        show={createnft__popup}
        onHide={() => {
          dispatch({ type: "createnft__close" });
          setSelectedFile("");
          setDetails(nftDetailDefaultValue);
          setFormValues([nftDefaultProperties]);
        }}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          className={styles.modal__header__wrapper}
          closeButton={nfts?.length > 0 ? true : false}
        >
          <div className="modal__title__wrapper">
            <Modal.Title>
              <div className={styles.modal__header}>
                <h2>Create an NFT</h2>
              </div>
            </Modal.Title>
          </div>
        </Modal.Header>
        <div className={styles.progress}>
          <ProgressBar now={(1 / 3) * 100} />
        </div>
        <Modal.Body>
          <div className={styles.modal__body__wrapper}>
            <h3>Upload Files</h3>

            <div className="file__wrapper" onDrop={handleDragableItem("placed")} onDragOver={handleDragableItem("over")}>
              <input
                type="file"
                id="files"
                name="file"
                data-testid="file-uploader"
                onChange={(e) => handleNewFileUpload(e.target.files)}
                onClick={(e) => {
                  e.target.value = null;
                }}
                accept={requiredFileExtensions.join(", ")}
                style={{ display: "none" }}
                required
              />
              <div className="file__upload__wrapper">
                <label htmlFor="files">
                  {selectedFile ? "Upload Another File" : "Choose File"}
                </label>
              </div>
              <p>{requiredFileExtensionsDescription}</p>
              <p>
                Max
                {" "}
                {fileHelper.convertBytesToMB(
                  fileHelper.DEFAULT_MAX_FILE_SIZE_IN_BYTES
                )}
                MB
              </p>
            </div>

            {selectedFile
            && (selectedFile?.type?.includes("video") ? (
              <div className="uploaded__file">
                <video
                  style={{ width: "100%", borderRadius: "8px" }}
                  src={URL.createObjectURL(selectedFile)}
                />
              </div>
            ) : selectedFile?.type?.includes("audio") ? (
              <div className="uploaded__file">
                <audio controls>
                  <source src={URL.createObjectURL(selectedFile)} />
                </audio>
              </div>
            ) : (
              <div className="uploaded__file">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Uploaded File"
                  onError={() => handleCorruptedFile()}
                />
              </div>
            ))}
          </div>

          <div className={styles.next__btn__wrapper}>
            <button
              onClick={() =>
                selectedFile
                  ? handleNftForm()
                  : toast.error("Please upload files.")}
              disabled={!selectedFile || corruptedFile}
              className={styles.next__btn}
              data-testid="next-button"
            >
              Next
              <span>
                <IoIosArrowForward />
              </span>
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* NFT Form Modal */}
      <Modal
        className={`${styles.initial__nft__modal} ${styles.nft__mobile__modal} ${styles.nft__form__modal} initial__modal`}
        show={nftForm}
        onHide={() => {
          setNftForm(false);
          setDetails(nftDetailDefaultValue);
          setFormValues([nftDefaultProperties]);
          setSelectedFile("");
        }}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          className={styles.modal__header__wrapper}
          closeButton={nfts?.length > 0 ? true : false}
        >
          <div className="modal__multiple__wrapper">
            <button onClick={() => goBack("initalForm")} className="back__btn">
              Back
            </button>
            <Modal.Title>
              <div className={styles.modal__header}>
                <h2>Create an NFT</h2>
              </div>
            </Modal.Title>
          </div>
        </Modal.Header>
        <div className={styles.progress}>
          <ProgressBar now={(2 / 3) * 100} />
        </div>
        <Modal.Body>
          <div className={styles.modal__body__wrapper}>
            <form>
              <div className={styles.form__group}>
                <label>
                  TITLE
                  <span className="requiredIndicator">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  data-testid="nft-title"
                  value={details.title}
                  onChange={inputEvent}
                  placeholder="Ex. Redeemable Art"
                  required
                  maxLength={72}
                />
                <span className={styles.descriptionCounter}>
                  {details.title.length}
                  {' '}
                  / 72
                </span>
              </div>
              <div className={styles.form__group}>
                <label>
                  DESCRIPTION
                  <span className="requiredIndicator">*</span>
                </label>
                <textarea
                  rows={5}
                  name="description"
                  value={details.description}
                  onChange={inputEvent}
                  placeholder="Ex. Redeemable Art"
                  required
                  style={{ resize: "none" }}
                  maxLength={500}
                  data-testid="nft-description"
                />
                <span className={styles.descriptionCounter}>
                  {details.description.length}
                  / 500
                </span>
              </div>
              <div className={styles.form__group}>
                <label>PROPERTIES</label>
                {formValues.map((val, index) => (
                  <div className={styles.form__group__inner} key={val.id}>
                    <input
                      type="text"
                      value={val.attr_name}
                      placeholder="Tag"
                      maxLength={30}
                      className={isTextEmpty(val.attr_name) && formValuesError ? "formError" : ""}
                      onChange={handleChange(index, "attr_name")}
                    />
                    <input
                      type="text"
                      value={val.attr_value}
                      placeholder="Value"
                      maxLength={30}
                      className={isTextEmpty(val.attr_value) && formValuesError ? "formError" : ""}
                      onChange={handleChange(index, "attr_value")}
                    />

                    {index ? (
                      <button
                        type="button"
                        className={styles.remove__btn}
                        onClick={() => removeFormFields(index)}
                      >
                        X
                      </button>
                    ) : null}
                  </div>
                ))}
                <button
                  className={styles.addFieldsBtn}
                  type="button"
                  onClick={() => addFormFields()}
                >
                  <span>
                    <AiOutlinePlus />
                  </span>
                  Add More
                </button>
              </div>
              <div className={styles.form__group}>
                <label>CATEGORY</label>
                <select
                  className={styles.form__category__dropdown}
                  name="category"
                  value={details.category}
                  onChange={inputEvent}
                  defaultValue="Digital Arts"
                  disabled
                >
                  {/* <option /> */}
                  <option value="Digital Arts">Digital Arts</option>
                </select>
              </div>
            </form>
          </div>
          <div className={styles.multiple__btn__wrapper}>
            <button
              onClick={handleNftPreview}
              className={styles.next__btn}
              data-testid="details-next-button"
            >
              Next
              <span>
                <IoIosArrowForward />
              </span>
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* NFT Preview Modal */}
      <Modal
        className={`${styles.initial__nft__modal} ${styles.nft__form__modal} initial__modal ${styles.nft__mobile__modal}`}
        show={nftPreview}
        onHide={() => {
          setNftPreview(false);
          setSelectedFile("");
          setDetails(nftDetailDefaultValue);
          setFormValues([nftDefaultProperties]);
        }}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header
          className={styles.modal__header__wrapper}
          closeButton={nfts?.length > 0 ? true : false}
        >
          <div className="modal__multiple__wrapper">
            <button onClick={() => goBack("nftForm")} className="back__btn">
              Back
            </button>
            <Modal.Title>
              <div className={styles.modal__header}>
                <h2>Create an NFT</h2>
              </div>
            </Modal.Title>
          </div>
        </Modal.Header>
        <div className={styles.progress}>
          <ProgressBar now={(2.9 / 3) * 100} />
        </div>
        <Modal.Body>
          <div className={styles.modal__body__wrapper}>
            <h6>Preview</h6>
            <div className={styles.mynft__box}>
              <div className={styles.mynft__box__image__wrapper}>
                {selectedFile
                && (selectedFile?.type?.includes("video") ? (
                  <video
                    style={{ width: "100%", borderRadius: "8px" }}
                    src={URL.createObjectURL(selectedFile)}
                    onError={() => handleCorruptedFile()}
                  />
                ) : selectedFile?.type?.includes("audio") ? (
                  <audio
                    style={{ marginTop: "60px", marginLeft: "5px" }}
                    controls
                    onError={() => handleCorruptedFile()}
                  >
                    <source src={URL.createObjectURL(selectedFile)} />
                  </audio>
                ) : (
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt={formInfo.title}
                    onError={() => handleCorruptedFile()}
                  />
                ))}
                {!audioRegex.test(selectedFile.type) && (
                  <div className={styles.mynft__box__cat}>
                    <h6>{details?.category}</h6>
                  </div>
                )}
              </div>
              <div className={styles.mynft__box__description__wrapper}>
                <h2>Title</h2>
                <p>{details.title}</p>
                <h2>Description</h2>
                <p>{details?.description}</p>
                <div className={styles.mynft__box__profile__info}>
                  <div className={styles.details__profile__picture} />
                  <div className={styles.details__user__info}>
                    <p>{user?.full_name}</p>
                    <h6>{user?.wallet_id}</h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.multiple__btn__wrapper}>
            <button
              onClick={() => {
                mineNft("mint");
                localStorage.removeItem("firstImport");
              }}
              disabled={loading || corruptedFile}
              className={styles.next__btn}
              data-testid="mint-nft-button"
            >
              Mint NFT
              <span>
                <IoIosArrowForward />
              </span>
            </button>
            <button
              onClick={() => {
                mineNft("gift");
                localStorage.removeItem("firstImport");
              }}
              disabled={loading || corruptedFile}
              className={styles.next__btn}
            >
              Gift NFT
              <span>
                <IoIosArrowForward />
              </span>
            </button>
          </div>
        </Modal.Body>
      </Modal>

      {/* NFT Mint Modal */}
      <Modal
        className={`${styles.initial__nft__modal} ${styles.nft__form__modal} nft__final__mobile__modal initial__modal`}
        show={nftMint}
        onHide={() => setNftMint(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header
          className={`${styles.modal__header__wrapper}  ${styles.modal__header__bottom} last__modal__header`}
          closeButton={nfts?.length > 0 ? true : false}
        />
        <Modal.Body className={styles.modal__body__top}>
          <div className={`${styles.modal__body__wrapper}`} data-testid="success-modal-body">
            <div className={styles.mint__info__wrapper}>
              <div className={styles.mint__image}>
                <img
                  src={
                    createNftResponse?.file_url
                      ? createNftResponse.file_url
                      : ""
                  }
                  alt=""
                />
              </div>
              <h1>
                {createNftResponse.title}
                <br />
                Successfully Minted
              </h1>
              <h6>
                NFT ID &nbsp;
                {createNftResponse?.nft_id}
              </h6>
            </div>
          </div>
          <div
            className={`${styles.multiple__btn__wrapper} ${styles.last__modal__btn}`}
          >
            <button onClick={openNftDetail} className={styles.next__btn}>
              Open
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
export default CreateNft;
