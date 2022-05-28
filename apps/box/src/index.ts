import {app} from "./app.js";

const main = async () => {
    const p = await app()
}

main().catch((e)=>{
    console.log(e.message)
})
