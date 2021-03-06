import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsArrowLeftRight } from "react-icons/bs";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import styles from "./SignIn.module.css";
import { API_BASE_URL } from "../../Utils/config";

const useStyles = makeStyles(() => ({
  inputfield: {
    margin: "10px 0px",
    width: "100%",
  },
  inputStyles: {
    textAlign: "left",
    fontWeight: 600,
    fontSize: "19.2px",
    lineHeight: "23px",
    color: "rgba(0, 0, 0, 0.91)",
  },
}));

const SignIn = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const [email, setemail] = useState("");
  const dispatch = useDispatch();
  const { redirectUrl } = useSelector((state) => state.authReducer);

  const handleLogin = async () => {
    const fd = new FormData();
    fd.append("user[email]", email);

    const response = await axios.post(`${API_BASE_URL}/login`, fd);
    const { status } = response;

    if (status === 200 || status === 201) {
      const {
        headers: { authorization },
        data: { data },
      } = response;

      axios.interceptors.request.use((config) => {
        config.headers.Authorization = authorization;

        return config;
      });
      dispatch({
        type: "login_Successfully",
        payload: { ...data, token: authorization },
      });
      navigate(redirectUrl ? redirectUrl : "/");
    } else {
      navigate("verification");
    }
  };

  return (
    <div className={styles.half_container}>
      <div className={styles.childContainer}>
        <BsArrowLeftRight className={styles.icon} />
        <div className={styles.requestText}>
          Prime Labs
          <br />
          is requesting to
          <br />
          access your account.
        </div>
        <p className={styles.para}>
          This does not allow the app to transfer
          <br />
          {' '}
          any tokens.
        </p>
        <div className={styles.MoreInfo}>More Info</div>

        {/* TEXT FIELD */}

        <div className={styles.textField}>
          <TextField
            id="outlined-select-currency"
            variant="outlined"
            placeholder="johndoe@gmail.com"
            value={email}
            className={classes.inputfield}
            fullWidth
            inputProps={{
              className: classes.inputStyles,
            }}
            onChange={(e) => setemail(e.target.value)}
          />
        </div>

        {/* BUTTON CONTAINER */}
        <div className={styles.buttonContainer}>
          <button
            onClick={() => navigate("/signup")}
            className={styles.secondary_button}
          >
            Deny
          </button>

          <button className={styles.primary_button} onClick={handleLogin}>
            Allow
          </button>
        </div>
      </div>
    </div>
  );
};
export default SignIn;
