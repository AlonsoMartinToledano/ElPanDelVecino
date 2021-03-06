import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useRecoilState } from "recoil";

import "./styles.css";
import { adminModeAtom } from "../recoil/atoms";

const SIGNIN = gql`
    mutation signin($userName: String!, $pwd: String!) {
        signin(userName: $userName, pwd: $pwd) {
            userName
        }
    }
`;

const Signin = () => {
    const [, setAdminMode] = useRecoilState(adminModeAtom);

    let inputUserName;
    let inputPwd;

    const [error, setError] = useState(null);
    const [signin, { data }] = useMutation(SIGNIN, {
        onError(err) {
            setError(err.message);
        }
    })

    return (
        <div className="Signin">
            <form className="ModuleSignin"
                onSubmit = { e => {
                    e.preventDefault();
                    inputUserName = document.getElementById("inputUserName").value;
                    inputPwd = document.getElementById("inputPwd").value;
                    signin({ variables: { userName: inputUserName, pwd: inputPwd }});
                }}
            >
                <div className="UserName">
                    <div className="Text">Nombre de Usuario</div>
                    <input required id="inputUserName" className="Input"/>
                </div>
                <div className="Pwd">
                    <div className="Text">Contraseña</div>
                    <input required id="inputPwd" type="password" className="Input"/>
                </div>

                {data ? <div className="Text">Usuario {data.signin.userName} creado</div> : null}
                {error ? <div>{error}</div> : null}

                <button className="Button" type="submit" onClick={() => setError(null)}>Crear cuenta</button>

                <div className="Button" onClick={() => {setAdminMode(0); setError(null)}}>Atrás</div>

            </form>
        </div>
    )
}

export default Signin;