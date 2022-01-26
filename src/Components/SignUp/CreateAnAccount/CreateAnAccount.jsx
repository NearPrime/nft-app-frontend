import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { InputAdornment } from "@material-ui/core";
import { ProgressBar } from "react-bootstrap";
import { AiFillCloseCircle } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import TextFieldComponent from "../../../Assets/FrequentlUsedComponents/TextFieldComponent";
import { isValidFullName, mapUserSession } from "../../../Utils/utils";
import AppLoader from "../../Generic/AppLoader";

import styles from "./CreateAnAccount.module.scss";
import { actionSetSession } from "../../../Store/Auth/actions";
import { createUserRequest } from "../../../api/user";
import TooltipButton from "../../../common/components/TooltipButton";

const CreateAnAccount = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { signupEmail, signupPhone } = useSelector(
    (state) => state.authReducer
  );
  const [isLoading, setIsloading] = useState(false);

  const loginFormMethod = useSelector(state => state.appState.loginFormMethod);

  const { accId } = useParams();

  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [windowState, setWindowState] = useState(window.innerWidth < 767);
  const { redirectUrl } = useSelector((state) => state.authReducer);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => {
        const ismobile = window.innerWidth < 767;
        if (ismobile !== windowState) setWindowState(ismobile);
      },
      false
    );
  }, [windowState]);

  const [info, setinfo] = useState("");

  const HandleClick = () => {
    if (location?.state?.user) {
      navigate('/settings')
    } else {
      navigate("/signup");
    }
  };

  useEffect(() => {
    if (location) {
      setFullName(location?.state?.user?.full_name)
    }
  }, [location])

  useEffect(() => {
    if (signupEmail === "" && signupPhone === "") {
      // HandleClick();
    }
  }, [info]);

  useEffect(() => {
    if (loginFormMethod === "email") {
      setAccountId(
        location?.state?.user ? "" : signupEmail?.split("@")[0]?.replaceAll(".", "")
        // + ".near"
      );
    } else {
      setAccountId(
        signupPhone.replaceAll("+", "")
        //  + ".near"
      );
    }
  }, [signupEmail, signupPhone]);

  // HandleClick for cancel button

  // HandleFocus for input
  const HandleFocus = (ClickedInput) => {
    setinfo(ClickedInput);
  };

  const doesAccountStringHaveValidCharacters = (accountString) => {
    const matchesCharacterRequirements = /^[a-z_0-9-]+$/i.test(accountString);
    const hasUppercaseLetter = /[A-Z]+?/.test(accountString);

    return matchesCharacterRequirements && !hasUppercaseLetter;
  };

  const doesAccountIdHaveValidLength = (accountString) =>
    accountString.length > 1 && accountString.length <= 56;

  const onAccountChange = (e) => {
    const { value } = e.target;

    if (!value || doesAccountStringHaveValidCharacters(value)) {
      if (value.length <= 56) setAccountId(value);
    }

    // setDetails((preValue) => {
    //   return {
    //     ...preValue,
    //     [name]: value,
    //   };
    // });
  };

  const onNameChange = (e) => {
    setFullName(e?.target?.value);
  };

  const handleSignup = async () => {
    // validate account id
    if (!doesAccountIdHaveValidLength(accountId)) {
      toast.warn("Please enter an account ID of between 2 and 56 characters.");
      return;
    }

    // signup body
    const user = {
      fullName: fullName.trim(),
      walletName: accountId.includes(".near") ? accountId : `${accountId}.near`,
      email: location?.state?.user ? location?.state?.user?.email : signupEmail,
      phone: signupPhone
    };

    // As a workaround for the claim NFT to work, we need to pass the NFT ID along with
    // the user details in the POST /user/create request body.
    const nftID = (redirectUrl || "").replace("/nft/detail/claim/", "");
    if (!!nftID) {
      user.nftID = nftID;
    }

    setIsloading(true);

    // Ajax Request to create user
    createUserRequest(user)
      .then(response => {
        const actionPayload = mapUserSession(response.data);
        if (actionPayload) {
          dispatch(actionSetSession(actionPayload));
        }

        // @ToDo
        // save user details
        localStorage.setItem("user", JSON.stringify(response.data));

        // cloudsponge import on signup
        localStorage.setItem("welcome", "true");
        localStorage.setItem("firstImport", "true");

        navigate(redirectUrl ? redirectUrl : "/");
      })
      .catch(error => {
        setIsloading(false);
        if (error.response.data) {
          toast.error(error.response.data.message);
        }
      });
  };

  const isFormValid = () => {
    let returnVal = true;
    if (fullName === "") {
      returnVal = false;
    } else if (!isValidFullName(fullName)) {
      returnVal = false;
    } else if (
      accountId === ""
      || !doesAccountStringHaveValidCharacters(accountId)
    ) {
      returnVal = false;
    }
    // console.log("isFormValid=>", returnVal);
    return returnVal;
  };

  const CheckAndSubmitForm = (e) => {
    if (e.which === 13 && isFormValid()) {
      handleSignup();
    }
  };

  return (
    <div className={styles.half_container}>
      {isLoading && <AppLoader />}
      <AiFillCloseCircle className={styles.cross} onClick={HandleClick} />
      <div className={styles.account__wrapper}>
        <span className={styles.createAnAccount}>Create an NFT account</span>
        {windowState && (
          <div className={styles.progress}>
            <ProgressBar now={(2 / 3) * 100} />
          </div>
        )}
      </div>

      <div className={styles.childContainer}>
        <p className={styles.left}>
          Enter an Account ID to use with your NEAR&nbsp;
          <br />
          account. Your Account ID will be used for all NEAR&nbsp;
          <br />
          operations, including sending and receiving&nbsp;
          <br />
          assets.
        </p>

        {/* input field for full name */}
        <div className={styles.textField}>
          <TextFieldComponent
            label="FULL NAME"
            variant="outlined"
            placeholder="Ex John Doe"
            InputValue={fullName}
            type="text"
            HandleInputChange={onNameChange}
            HandleFocus={() => HandleFocus("name")}
            HandelKeyPress={(e) => {
              CheckAndSubmitForm(e);
            }}
          />
        </div>

        {/* input field for account id */}
        <div className={styles.textField}>
          <TextFieldComponent
            label="ACCOUNT ID"
            variant="outlined"
            // InputValue={details.id}
            InputValue={accountId}
            name="id"
            HandleInputChange={onAccountChange}
            placeholder="yourname.near"
            type="text"
            HandelKeyPress={(e) => {
              CheckAndSubmitForm(e);
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="start"
                  className={`${styles.button} ${styles.secondary} ${styles.active}`}
                >
                  <span>.near</span>
                </InputAdornment>
              )
            }}
            HandleFocus={() => HandleFocus("id")}
            // disabled
          />
        </div>

        {/* create account button */}
        <button
          onClick={handleSignup} // createAccount
          className={`${styles.secondary_button} ${
            isFormValid() ? styles.active_button : ""
          }`}
          disabled={!isFormValid()}
        >
          Create an account
          <span>
            <IoIosArrowForward />
          </span>
        </button>

        <p>
          By creating a NEAR account, you agree to the&nbsp;
          <br />
          NEAR Wallet&nbsp;
          <span>
            <a
              href="https://terms.nftmakerapp.io/"
              rel="noreferrer"
              target={"_blank"}
            >
              Terms of Service
            </a>
          </span>
          &nbsp; and&nbsp;
          <span>
            <a
              href="https://privacy.nftmakerapp.io/"
              rel="noreferrer"
              target={"_blank"}
            >
              Privacy Policy
            </a>
          </span>
          .
        </p>

        {!accId && (
          <>
            <h6 className={styles.link}>Already have a NearApps ID?</h6>

            <TooltipButton tooltipText="Coming soon..." buttonText="Login with NEAR" buttonStyle={`${styles.comingSoonBtn}`} />
          </>
        )}
      </div>
    </div>
  );
};

export default CreateAnAccount;
