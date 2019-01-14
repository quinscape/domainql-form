import path from "path";
import fs from "fs";
import getSchema from "./getSchema";

export default function dumpUsage() {

    // XXX: updates types-used.json after test-runs to minimize schema
    //
    // const filePath = path.resolve( __dirname , "../../types-used.json");
    //
    // let data;
    // if (!fs.existsSync(filePath))
    // {
    //      data = {
    //          typesUsed: []
    //      };
    // }
    // else
    // {
    //     data = JSON.parse(fs.readFileSync(filePath, "UTF-8"));
    // }
    //
    // for (let type of getSchema().getTypesUsed().values())
    // {
    //     if (data.typesUsed.indexOf(type) < 0)
    //     {
    //         data.typesUsed.push(type);
    //     }
    // }
    // fs.writeFileSync(filePath, JSON.stringify(data, null, 4), "UTF-8");

}
