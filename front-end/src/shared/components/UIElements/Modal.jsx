import React from "react";
import "./Modal.css";
import ReactDOM from "react-dom";
import { CSSTransition } from "react-transition-group";
import Backdrop from "./Backdrop";

const ModalOverlay = props => {
    const style = {
        width: props.width,
        top: props.top,
    }
    const content = (
        <div className={`modal ${props.center && 'modal--center'}`} style={style}>
            {props.content}
            {props.children}
        </div>
    );
    return ReactDOM.createPortal(content, document.getElementById("modal-hook"));
}

const Modal = props => {
    return <React.Fragment>
        {props.show && <Backdrop onClick={props.onCancel} />}
        <CSSTransition in={props.show} mountOnEnter unmountOnExit classNames="modal">
            <ModalOverlay {...props} >{props.children}</ModalOverlay>
        </CSSTransition>
    </React.Fragment>
};

export default Modal;