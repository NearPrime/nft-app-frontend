import React from "react";
import {
  IoIosArrowForward,
  IoMdMail,
  IoMdMap,
  IoMdPhonePortrait,
} from "react-icons/io";
import { useSelector } from 'react-redux';
import { Link, useNavigate } from "react-router-dom";
import HomeCard1 from "../../Assets/Images/home-card-1.svg";
import HomeCard2 from "../../Assets/Images/home-card-2.svg";
import Logo from "../../Assets/Images/prime-lab-logo.png";
import styles from "./index.module.scss";

import GetStartedButton from "./components/GetStartedButton";

const HomePage = (props) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.authReducer);

  const HandleLoginWithNear = () => {
    if (user) {
      navigate('/', { replace: true });
    } else {
      navigate("/signin");
    }
  };

  const pageName = props.pageName || "home";

  return (
    <div className={styles.mainContainer}>
      <div className={styles.leftSide}>
        <Link to="/">
          <img src={Logo} className={styles.logo} alt="Brand Logo" />
        </Link>
        <h3 className={styles.leftSideMainText}>
          The easiest way to Create NFTs and share them with others. Start minting
          NFTs in NEAR&apos;s rapidly expanding ecosystem
        </h3>
        <li className={styles.loginButton}>
          <button onClick={HandleLoginWithNear}>
            {user ? 'Dashboard' : 'Launch'}
            <span>
              <IoIosArrowForward />
            </span>
          </button>
        </li>
      </div>

      <div className={styles.rightSide}>
        <div className={styles.rightSideHeader}>
          <ul>
            <li className={pageName === "about-us" ? styles.is_selected : ""}>
              <Link to="/about-us">About Us</Link>
            </li>
            <li className={pageName === "contact-us" ? styles.is_selected : ""}>
              <Link to="/contact-us">Contact Us</Link>
            </li>
            <li className={styles.menuLoginButton}>
              <button onClick={HandleLoginWithNear}>
                {user ? 'Dashboard' : 'Launch'}
                <span>
                  <IoIosArrowForward />
                </span>
              </button>
            </li>
          </ul>
        </div>
        <div className={styles.rightSideBody}>
          {pageName === "home" && (
          <>
            <h2>NFT Maker App</h2>

            <div className={`${styles.getStartedBtn} ${styles.onlyOnMobile}`}>
              {!user && <GetStartedButton />}
            </div>

            <p className={styles.nftMakerAppDesc}>
              The easiest way to Create NFTs and share them with others. Start
              minting NFTs in NEAR&apos;s rapidly expanding ecosystem
            </p>

            <div className={styles.imageContainer}>
              <img src={HomeCard2} alt="home-card-2" className={styles.image1st} />
              <img src={HomeCard1} alt="home-card-1" className={styles.image2nd} />
            </div>
            <div className={styles.nftAboutFeatureList}>
              <ul>
                <li>Create NFTs</li>
                <li>Share with Friends</li>
                <li>Explore Blockchain</li>
              </ul>
            </div>
            <div className={`${styles.getStartedBtn} ${styles.onlyOnDesktop}`}>
              {!user && <GetStartedButton />}
            </div>
          </>
          )}

          {pageName === "about-us" && (
          <>
            <h2>About NFT Maker App</h2>
            <div className={styles.pageContent}>
              <p>
                The easiest way to Create NFTs and share them with others. Start
                minting NFTs in NEAR&apos;s rapidly expanding ecosystem
              </p>
              <p>
                <b>Features</b>
              </p>
              <ul>
                <li>Create NFTs</li>
                <li>Share with Friends</li>
                <li>Explore Blockchain</li>
              </ul>
            </div>
            <div className={styles.getStartedBtn}>
              {!user && <GetStartedButton />}
            </div>
          </>
          )}

          {pageName === "contact-us" && (
          <>
            <h2>Contact Us</h2>
            <div className={styles.pageContent}>
              <ul className={styles.contactList}>
                <li className={styles.listItem}>
                  <span>
                    <IoMdMap className={styles.addressIcons} />
                  </span>
                  <span className={`${styles.contactText} ${styles.place}`}>
                    Growth Lab, Inc. 1209 Orange Street, Wilmington Delaware
                  </span>
                </li>

                <li className={styles.listItem}>
                  <span>
                    <IoMdPhonePortrait className={styles.addressIcons} />
                  </span>
                  <span className={`${styles.contactText} ${styles.phone}`}>
                    <a href="tel:+1 984-230-3429" title="">
                      +1 984-230-3429
                    </a>
                  </span>
                </li>

                <li className={styles.listItem}>
                  <span>
                    <IoMdMail className={styles.addressIcons} />
                  </span>
                  <span className={`${styles.contactText} ${styles.gmail}`}>
                    <a href="mailto:support@nftmakerapp.io" title="">
                      support@nftmakerapp.io
                    </a>
                  </span>
                </li>
              </ul>
            </div>
            <div className={styles.getStartedBtn}>
              {!user && <GetStartedButton />}
            </div>
          </>
          )}

          <div className={styles.privacyPolicyTC}>
            <ul>
              <li>
                <a href="https://privacy.nftmakerapp.io/">Privacy Policy</a>
              </li>
              <li>
                <a href="https://terms.nftmakerapp.io/">Terms of Service</a>
              </li>
            </ul>
          </div>
          <div className={styles.copyRightText}>
            &copy;
            {' '}
            {new Date().getFullYear()}
            {' '}
            Prime Lab.
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomePage;
