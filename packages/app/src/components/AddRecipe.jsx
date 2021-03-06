import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { useRecoilState } from "recoil";

import "./styles.css";
import { adminModeAtom } from "../recoil/atoms";
import UploadFile from "./UploadFile";
import Step from "./Step";
import IngredientRecipe from "./IngredientRecipe";
import { INGREDIENTS } from "./RemoveIngredient";

const ADD_RECIPE = gql`
    mutation addRecipe($userid: ID!, $token: String!, $title: String!, $description: String!, $steps: [StepInput!]!, $ingredients: [ID!]!, $mainImage: FileInput!) {
        addRecipe(userid: $userid, token: $token, title: $title, description: $description, steps: $steps, ingredients: $ingredients, mainImage: $mainImage) {
            title
            steps {
                description
                image {
                    mimetype
                }
            }
            ingredients {
                _id
            }
            mainImage {
                mimetype
            }
        }
    }
`;

const AddRecipe = () => {
    const [, setAdminMode] = useRecoilState(adminModeAtom);
    const [updateSteps, setUpdateSteps] = useState(true);
    const [stepList, setStepList] = useState([]);
    // const [error, setError] = useState(null);

    useEffect(() => {}, [updateSteps]);

    let mainImage;
    let inputTitle;
    let inputDescription;
    const steps = [];

    const [addRecipe, { data }] = useMutation(ADD_RECIPE, {
        // refetchQueries: [{ query: INGREDIENTS }],

        // onError(err) {
        //     setError(err.message);
        // }
    })

    if (data) {
        console.log(data.addRecipe);
    }

    return (
        <div className="AddRecipe">
            <form className="ModuleAddIngredient"
                onSubmit = { e => {
                    e.preventDefault();
                    inputTitle = document.getElementById("inputTitle").value;
                    inputDescription = document.getElementById("inputDescription").value;
                    addRecipe({ variables: { userid: localStorage.getItem("userid"), token: localStorage.getItem("token"),
                        title: inputTitle, description: inputDescription, steps: steps, ingredients: ["5efcb5ca1009da06c45f2151"], mainImage: {url: "url", mimetype: "mimetype", encoding: "encoding"} }});
                    // setError(null);
                }}
            >
                {/* <div>
                    <div className="Text">Imagen principal</div>
                    <UploadFile image={mainImage}/>
                </div> */}

                <div>
                    <div className="Text">Título</div>
                    <input required id="inputTitle" className="Input"/>
                </div>

                <div>
                    <div className="Text">Descripción</div>
                    <textarea required id="inputDescription" type="text" className="Input"/>
                </div>

                <div>
                    <div className="Text">Pasos</div>
                    <Step steps={steps} numStep={0} />
                    <Step steps={steps} numStep={1}/>
                </div>

                {/* <div>
                    <div className="Text">Ingredientes</div>
                    {ingredients}
                </div> */}

                {/* {data ? <div className="Text">{data.addIngredient.name} añadida</div> : null} */}
                {/* {error ? <div>{error}</div> : null} */}

                <button className="Button" type="submit">Añadir Receta</button>

                <div className="Button" onClick={() => setAdminMode(0)}>Atrás</div>

            </form>
        </div>
    )
}

export default AddRecipe;