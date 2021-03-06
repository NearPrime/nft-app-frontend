import React from 'react';
import { Modal } from "react-bootstrap";
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { LOGOUT } from "../../Reducers/ActionTypes";
import styles from './styles.module.css';
import { removeBlur } from '../../Utils/utils';

function SignoutDialogue({ show, setShowSignoutModal, setImportContactDialogue }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const SignOut = () => {
    dispatch({ type: LOGOUT });
    localStorage.removeItem("user");
    removeBlur();
    navigate("/");
  };

  return (
    <Modal
      className={`${styles.connection__modal} initial__modal`}
      show={show}
      backdrop="static"
      centered
      keyboard={false}
    >
      <Modal.Header
        className={`${styles.modal__header__wrapper} modal__settings__wrapper`}
      >

        <div className="modal__title__wrapper">
          <Modal.Title>
            <div className={styles.modal__header}>
              <h2>
                Logout & Start Over?
              </h2>
            </div>
          </Modal.Title>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.btn__wrapper}>
          <button onClick={() => { setImportContactDialogue(true); setShowSignoutModal(false) }} className={`${styles.next__btn} ${styles.cancel__btn}`}>
            Stay
          </button>

          <button onClick={SignOut} className={`${styles.next__btn} ${styles.confirm__btn}`}>
            Logout
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default SignoutDialogue;
