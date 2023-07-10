import { Model } from "@edge-effect/model-js";
import { Post } from "../dto/PostDto";

export default class PostModel extends Model {
    protected getDomain(): string {
        return "https://jsonplaceholder.typicode.com";
    }

    public async getPost(id: number) {
        return this.get<Post>({
            path: `posts/${id}`,
        });
    }

    public async getPosts() {
        return this.get<ReadonlyArray<Post>>({
            path: "posts",
        });
    }
}
