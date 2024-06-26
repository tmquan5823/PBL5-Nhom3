import React from "react";
import "./DeleteCategoryConfirm.css";

const DeleteCategoryConfirm = props => {
    function deleteConfirm(event) {
        event.preventDefault();
        props.onDelete(props.id);
    }

    function cancelHandler() {
        props.onClose();
    }

    return <div className="delete-category-confirm">
        <div className="dcc__icon">
            <div style={{ backgroundColor: props.color }} className="dcc__icon-content">
                <img src={props.icon} alt="" />
            </div>
        </div>
        <h2 className="dcc__title">Xoá danh mục {props.content}</h2>
        <span className="dcc__span">Bạn có thực sự muốn xóa danh mục {props.content}</span>
        <button onClick={deleteConfirm} className="dcc__delete-btn">Xóa danh mục</button>
        <a href="#" onClick={cancelHandler} className="dcc__cancel">Hủy</a>
    </div>
};

export default DeleteCategoryConfirm;