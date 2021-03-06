import React, { memo, useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { IoIosArrowForward } from "react-icons/io";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import muiDialogCallbackStatuses from "../../../constants/muiDialogCallbackStatuses";
import styles from "./Home.module.css";

import create_nft_left from "../../../Assets/Images/create-nft-left.png";
import create_nft_right from "../../../Assets/Images/create-nft-right.png";

import MyNFT from "./MyNft";
import Transactions from "./RecentTransactions";
import HomeHeader from "./HomeHeader";
import ImportContactsDialog from "../../ImportContactsDialog/ImportContactsDialog";
import ContactPopup from "../../../common/components/ContactPopup";
import SignoutDialogue from "../../SignoutDialogue";

const Home = () => {
  const dispatch = useDispatch();
  const [importContactDialog, setImportContactDialog] = useState(false);
  const [showContactListPopup, setShowContactListPopup] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [signoutModal, setShowSignoutModal] = useState(false);

  const firstImport = localStorage.getItem("firstImport")

  const HandleDialogOpen = () => {
    setImportContactDialog(true);
  };

  useEffect(() => {
    if (localStorage.getItem("welcome") === "true") {
      HandleDialogOpen();
    }
  }, []);

  const HandleDialogClose = () => {
    setImportContactDialog(false);
  };

  const openCreateNFTPopup = () => {
    setShowContactListPopup(false);
    dispatch({ type: "createnft__open" });
  };

  const importContact = (data) => {
    if (data) {
      setAllContacts(data);
      dispatch({
        type: "getGoogleContactData",
        payload: data,
      });
    }
  };

  const contactImportCallback = (error, source) => {
    setImportContactDialog(false);

    // Handling clicks outside the import dialog box
    if (muiDialogCallbackStatuses.includes(source)) {
      localStorage.removeItem("welcome")
      localStorage.setItem("contactImport", true)
      dispatch({ type: "createnft__open" });
      const all = document.getElementsByClassName("contactDialogBack");
      for (let i = 0; i < all.length; i++) {
        all[i].style.visibility = "hidden";
      }
      return;
    }

    if (error) {
      if (!muiDialogCallbackStatuses.includes(source)) {
        toast.error(`Something Went Wrong Fetching Contacts From ${source}`);
      }
      dispatch({ type: "createnft__open" });
    } else {
      toast.success(`Your contacts were successfully imported from ${source}`);
      HandleDialogClose();
      openCreateNFTPopup();
    }
  };

  return (
    <div className={styles.home__main__wrapper}>
      <Container>
        {/* Home Header  */}
        <HomeHeader />

        <SignoutDialogue
          setImportContactDialogue={setImportContactDialog}
          show={signoutModal}
          setShowSignoutModal={setShowSignoutModal}
        />

        <ImportContactsDialog
          onImport={importContact}
          status={importContactDialog}
          callback={contactImportCallback}
          setImportContactDialog={setImportContactDialog}
          setShowSignoutModal={setShowSignoutModal}
          setStatus={setImportContactDialog}
        />

        <ContactPopup
          data={allContacts}
          displayImportContact={false}
          show={showContactListPopup}
          onClose={() => {
            openCreateNFTPopup();
          }}
          onBack={() => {
            openCreateNFTPopup();
          }}
          title={"Gift an NFT"}
          btnText={firstImport ? "Gift NFT" : "Send NFT"}
          handleBtnClick={() => {
            openCreateNFTPopup();
          }}
          firstImport={firstImport}
        />

        {/* Home Create NFT Container */}
        <div className={styles.create__nft__container}>
          <div className={styles.create__nft__content}>
            <div>
              <h1>
                Start Creating Your
                {' '}
                <strong>NFTs</strong>
                {' '}
                Today
              </h1>
              <div className={styles.btn__wrapper}>
                <button onClick={() => {
                  dispatch({ type: "createnft__open" })
                  localStorage.removeItem("firstImport")
                }}
                >
                  Create NFT
                  {" "}
                  <span>
                    <IoIosArrowForward />
                  </span>
                </button>
              </div>
            </div>
          </div>
          <img
            src={create_nft_left}
            className={styles.create_nft_left}
            alt="Create NFT"
          />
          <img
            src={create_nft_right}
            alt="Create NFT"
            className={styles.create_nft_right}
          />
        </div>

        <MyNFT isLink />
        <Transactions />
      </Container>
    </div>
  );
};
export default memo(Home);
