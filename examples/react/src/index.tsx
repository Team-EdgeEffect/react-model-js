import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import DetailApp from "./DetailApp";
import { ModelContextProvider } from "@edge-effect/react-model-js";
import LocalApp from "./LocalApp";
import { BrowserRouter } from "react-router-dom";

const renderer = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const Root = (): JSX.Element => {
    return (
        <>
            <BrowserRouter>
                <ModelContextProvider>
                    <DetailApp />
                    {/* <LocalApp /> */}
                </ModelContextProvider>
            </BrowserRouter>
        </>
    );
};

renderer.render(<Root />);
