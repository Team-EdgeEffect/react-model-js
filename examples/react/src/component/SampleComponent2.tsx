import { useGetModel } from "@edge-effect/react-model-js";
import { MouseEventHandler, useState } from "react";
import PostModel from "../model/PostModel";
import { isResponseError } from "@edge-effect/model-js";
import { isResponseSuccess } from "../Test";

interface SampleComponent2Props {}
export const SampleComponent2 = (props: SampleComponent2Props): JSX.Element => {
    const postModel = useGetModel(PostModel);

    const [result, setResult] = useState<string | null>(null);

    return (
        <div>
            <h2>SampleComponent1</h2>
            <button
                onClick={async () => {
                    const response = await postModel.getPost(1);
                    if (isResponseSuccess(response)) {
                        const content = response.content;
                        setResult(`{ id: ${content.id}, userId: ${content.userId}, title: ${content.title}, body: ${content.body} }`);
                    } else if (isResponseError(response)) {
                        alert("An error occurred during your request.");
                    }
                }}>
                do
            </button>
            <span>{result}</span>
        </div>
    );
};
