import React, { useState, useEffect, useContext } from "react";
import "./UserMainInformation.css";
import { useForm } from "../../../shared/hooks/form-hook";
import Input from "../../../shared/components/FormElements/Input";
import { VALIDATOR_REQUIRE, VALIDATOR_EMAIL } from "../../../shared/util/validators";
import DatePicker from 'react-datepicker';
import { useHttpClient } from "../../../shared/hooks/http-hook";
import { AuthContext } from "../../../shared/context/auth-context";
import LoadingSpinner from "../../../shared/components/UIElements/LoadingSpinner";

const UserMainInformation = props => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [birthDay, setBirthDay] = useState(new Date());
    const [userinfo, setUserinfo] = useState();
    const [updateState, setUpdateState] = useState(false);
    const [formState, inputHandler, setFormData] = useForm({
        first_name: {
            value: "",
            isValid: false
        },
        last_name: {
            value: "",
            isValid: false
        },
        email: {
            value: "",
            isValid: false
        },
        phone_num: {
            value: "",
            isValid: false
        },
        date_of_birth: {
            value: new Date(),
            isValid: false
        },
        address: {
            value: "",
            isValid: false
        },
    }, false);

    async function fetchData() {
        try {
            const responseData = await sendRequest(process.env.REACT_APP_URL + '/api/user', 'GET', null,
                {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + auth.token
                });

            if (responseData.state) {
                setUserinfo(responseData);
                let birthday;
                if (!responseData.date_of_birth) {
                    birthday = new Date();
                } else {
                    birthday = new Date(responseData.date_of_birth);
                }
                setFormData({
                    first_name: {
                        value: responseData.first_name,
                        isValid: true
                    },
                    last_name: {
                        value: responseData.last_name,
                        isValid: true
                    },
                    email: {
                        value: responseData.email,
                        isValid: true
                    },
                    phone_num: {
                        value: responseData.phone_num || "",
                        isValid: true
                    },
                    date_of_birth: {
                        value: birthday,
                        isValid: true
                    },
                    address: {
                        value: responseData.address || "",
                        isValid: true
                    },
                }, false);
                setUpdateState(false);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    function inputChangeHandler(id, value, isValid) {
        setUpdateState(true);
        inputHandler(id, value, isValid);
    }

    function cancelUpdateHandler(event) {
        event.preventDefault();
        let birthday;
        if (!userinfo.date_of_birth) {
            birthday = new Date();
        } else {
            birthday = new Date(userinfo.date_of_birth);
        }

        setUpdateState(false);
        setFormData({
            first_name: {
                value: userinfo.first_name,
                isValid: true
            },
            last_name: {
                value: userinfo.last_name,
                isValid: true
            },
            email: {
                value: userinfo.email,
                isValid: true
            },
            phone_num: {
                value: userinfo.phone_num || "",
                isValid: true
            },
            date_of_birth: {
                value: birthday,
                isValid: true
            },
            address: {
                value: userinfo.address || "",
                isValid: true
            },
        }, false);
    }

    async function submitUpdateHandler(event) {
        event.preventDefault();
        try {
            const responseData = await sendRequest(process.env.REACT_APP_URL + '/api/user', 'PUT',
                JSON.stringify({
                    firstname: formState.inputs.first_name.value,
                    lastname: formState.inputs.last_name.value,
                    telephone: formState.inputs.phone_num.value,
                    address: formState.inputs.address.value,
                    dateOfBirth: formState.inputs.date_of_birth.value
                }), {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + auth.token
            });
            console.log(responseData);
            if (responseData.state) {
                setUpdateState(false);
            }
        } catch (err) {
            console.log(err);
        }
    }

    if (!userinfo) {
        return <LoadingSpinner asOverlay />;
    }

    return <React.Fragment>
        {isLoading && <LoadingSpinner asOverlay />}
        <form className="main-infor">
            <div className="main-infor__row">
                <Input id="first_name"
                    text="Họ"
                    element="input"
                    type="text"
                    value={formState.inputs.first_name.value}
                    onInput={inputChangeHandler}
                    validators={[VALIDATOR_REQUIRE()]}
                    width="48%"
                    initialIsValid={true}
                />
                <Input id="last_name"
                    text="Tên"
                    element="input"
                    type="text"
                    onInput={inputChangeHandler}
                    validators={[VALIDATOR_REQUIRE()]}
                    width="48%"
                    value={formState.inputs.last_name.value}
                    initialIsValid={true} />
            </div>
            <Input id="email"
                text="Email"
                element="input"
                type="text"
                disabled
                validators={[VALIDATOR_EMAIL()]}
                onInput={inputChangeHandler}
                width="90%"
                value={formState.inputs.email.value}
                initialIsValid={true} />
            <div className="main-infor__row">
                <Input id="date_of_birth"
                    text="Ngày sinh"
                    element="datepicker"
                    onInput={inputChangeHandler}
                    width="48%"
                    value={formState.inputs.date_of_birth.value}
                    initialIsValid={true} />
                {/* <div className="pickdate-container">
                    <label htmlFor="">Ngày sinh</label>
                    <DatePicker
                        selected={birthDay}
                        onChange={birthDayChangeHandler}
                        dateFormat="dd/MM/yyyy"
                    />
                </div> */}
                <Input id="phone_num"
                    text="Số điện thoại"
                    element="input"
                    type="text"
                    numberOnly
                    onInput={inputChangeHandler}
                    width="48%"
                    value={formState.inputs.phone_num.value}
                    initialIsValid={true} />
            </div>
            <Input id="address"
                text="Địa chỉ"
                element="input"
                type="text"
                onInput={inputChangeHandler}
                width="90%"
                value={formState.inputs.address.value}
                initialIsValid={true} />
            {updateState && (
                <div className="buttons-container">
                    <button onClick={submitUpdateHandler} className="save-btn">
                        Lưu
                    </button>
                    <button onClick={cancelUpdateHandler} className="cancel-btn">
                        Hủy
                    </button>
                </div>)}
        </form>
    </React.Fragment>
};

export default UserMainInformation;