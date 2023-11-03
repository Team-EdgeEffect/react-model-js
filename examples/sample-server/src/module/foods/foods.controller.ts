import { Controller, Get } from "@nestjs/common";

@Controller("foods")
export class FoodsController {
    @Get()
    findAll(): string {
        return "strings...";
    }
}
