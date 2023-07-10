import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import DetailApp from "./DetailApp";
import { ModelContextProvider } from "@edge-effect/react-model-js";
import LocalApp from "./LocalApp";

const renderer = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const Root = (): JSX.Element => {
    return (
        <>
            <ModelContextProvider>
                {/* <DetailApp /> */}
                <LocalApp />
            </ModelContextProvider>
        </>
    );
};

renderer.render(<Root />);
