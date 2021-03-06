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
        }
    }
`;

const AddRecipe = () => {

    let mainImage;
    let inputTitle;
    let inputDescription;
    let recipeIngredients = [];

    let newStep;

    const [, setAdminMode] = useRecoilState(adminModeAtom);
    const [error, setError] = useState(null);
    const [numStep, setNumStep] = useState(0);
    const [steps, setSteps] = useState([<Step />]);

    const [addRecipe, { dataa }] = useMutation(ADD_RECIPE, {
        // refetchQueries: [{ query: INGREDIENTS }],

        onError(err) {
            setError(err.message);
        }
    })

    const { data } = useQuery(INGREDIENTS, {
        onError(err) {
            setError(err.message);
        }
    });

    useEffect(() => {}, [numStep])

    let ingredients;
    if (data) {
        console.log(data.ingredients)
        ingredients = data.ingredients.map(obj => {
            return <IngredientRecipe name={obj.name} ingredientid={obj._id} recipeIngredients={recipeIngredients} />
        })
    }

    if (dataa) {
        console.log(dataa);
    }

    return (
        <div className="AddRecipe">
            <form className="ModuleAddIngredient"
                onSubmit = { e => {
                    e.preventDefault();
                    inputTitle = document.getElementById("inputTitle").value;
                    inputDescription = document.getElementById("inputDescription").value;
                    addRecipe({ variables: { userid: localStorage.getItem("userid"), token: localStorage.getItem("token"),
                        title: inputTitle, description: inputDescription, steps: steps, ingredients: ingredients, mainImage: mainImage }});
                    setError(null);
                }}
            >
                <div>
                    <div className="Text">Imagen principal</div>
                    <UploadFile mainImage={mainImage}/>
                </div>

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
                    <div className="Button" onClick={() => {
                        newStep = steps;
                        newStep.push(<Step />)
                        setSteps(newStep);

                        setNumStep(numStep + 1);
                    }}>+</div>
                    {steps.map(step => {
                        return step;
                    })}
                </div>

                <div>
                    <div className="Text">Ingredientes</div>
                    {ingredients}
                </div>

                {/* {data ? <div className="Text">{data.addIngredient.name} añadida</div> : null} */}
                {error ? <div>{error}</div> : null}

                <button className="Button" type="submit">Añadir receta</button>

                <div className="Button" onClick={() => setAdminMode(0)}>Atrás</div>

            </form>
        </div>
    )
}

export default AddRecipe;