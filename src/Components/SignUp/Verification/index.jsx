import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ProgressBar } from "react-bootstrap";
import { AiFillCloseCircle } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import VerificationInput from "react-verification-input";
import { toast } from "react-toastify";
import axios from "axios";
import styles from "./index.module.css";
import AppLoader from "../../Generic/AppLoader";
import { API_BASE_URL } from "../../../Utils/config";
import { mapUserSession, isOnlyNumber } from "../../../Utils/utils";
import { SET_SESSION } from "../../../Reducers/ActionTypes";

const Verification = () => {
  const dispatch = useDispatch();

  const [windowstate, setWindow] = useState(window.innerWidth < 767);
  const [allowLogin, setAllowLogin] = useState(false);
  const [isLoading, setIsloading] = useState(false);
  const [details, setDetails] = useState({
    verification: [],
  });
  const { redirectUrl, otp_medium } = useSelector((state) => state.authReducer);
  const { accountId } = useParams();

  const navigate = useNavigate();
  useEffect(() => {
    window.addEventListener(
      "resize",
      () => {
        const ismobile = window.innerWidth < 767;
        if (ismobile !== windowstate) setWindow(ismobile);
      },
      false
    );
  }, [windowstate]);

  // HandleClick for cancel button
  const HandleClick = () => {
    navigate("/signin");
  };

  const inputEvent = (e) => {
    const { name, value } = e.target;
    if (value.length && !isOnlyNumber(value)) {
      e.preventDefault();
    } else {
      setDetails((preValue) => ({
        ...preValue,
        [name]: value.slice(0, 6),
      }));
    }
  };

  useEffect(() => {
    if (details.verification.length >= 6) {
      setAllowLogin(true);
    } else {
      setAllowLogin(false);
    }
  }, [details.verification]);

  const LogIn = async () => {
    setIsloading(true);

    // Ajax Request to send otp
    axios
      .post(`${API_BASE_URL}/login/verify`, {
        walletName: accountId.includes(".near")
          ? accountId
          : `${accountId}.near`,
        nonce: details.verification,
      })
      .then((response) => {
        const actionPayload = mapUserSession(response.data);

        if (actionPayload) {
          dispatch({
            type: SET_SESSION,
            payload: actionPayload,
          });
        }

        // @ToDo
        // save user details
        localStorage.setItem("user", JSON.stringify(response.data));

        navigate(redirectUrl ? redirectUrl : "/");
      })
      .catch((error) => {
        if (error.response.data) {
          toast.error(error.response.data.message);
        }
      })
      .finally(() => {
        setIsloading(false);
      });
  };

  const ResendOTP = async () => {
    setIsloading(true);

    // Ajax Request to send otp
    axios
      .post(`${API_BASE_URL}/login`, {
        walletName: accountId.includes(".near")
          ? accountId
          : `${accountId}.near`,
      })
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        if (error.response.data) {
          toast.error(error.response.data.message);
        }
      })
      .finally(() => {
        setIsloading(false);
      });
  };

  return (
    <div className={styles.half_container}>
      {isLoading && <AppLoader />}
      <AiFillCloseCircle className={styles.cross} onClick={HandleClick} />
      <div className={styles.container__header}>
        <span className={styles.verification}>Authentication</span>
        {windowstate && (
          <div className={styles.progress}>
            <ProgressBar now={(1 / 3) * 100} />
          </div>
        )}
      </div>

      <div className={styles.childContainer}>
        <p>
          Check your&nbsp;
          {otp_medium}
          &nbsp;and enter your 6 Digit One-time passcode.
        </p>

        <div className={styles.verficationContainer}>
          <p className={styles.enterCode}>Enter Verification Code</p>
          <VerificationInput
            autoFocus
            placeholder=" "
            classNames={{
              container: "verification__container",
              character: "character",
              characterSelected: "character--selected",
            }}
            length={6}
            value={details.verification}
            // value={""}
            validChars={[0 - 9]}
            inputProps={{
              value: details.verification,
              name: "verification",
              onChange: inputEvent,
            }}
          />
        </div>

        <button
          className={`${styles.button} ${styles.secondaryColor}`}
          disabled={allowLogin ? false : true}
          onClick={() => LogIn()}
        >
          Continue
          {
            <span>
              <IoIosArrowForward />
            </span>
          }
        </button>

        <hr />

        <h4>Didn&apos;t receive your code?</h4>

        <Link to="." onClick={() => ResendOTP()} className={styles.link}>
          Resend your code
        </Link>
      </div>
    </div>
  );
};
export default Verification;
