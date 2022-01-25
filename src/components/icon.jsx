const lastArray = (arr) => {
    return arr[arr.length - 1];
}

const Icon = ({icon = null, name,isOpen = false}) => {
    if(icon == null && typeof name == "string"){
        name = name.toLowerCase();
        if(name.indexOf(".") == -1){
            icon = folderIcons[name] ?? "folder";
        }else{
            name = lastArray(name.split("."));
            icon = fileIcons[name] ?? "file";
        }
        //if(listIcons[name]) icon = listIcons[name];
        //console.log(listIcons[name],lastArray(name.split(".")));
    }

    if(icon == null || icon == "" || icon == undefined) icon = "file";
    return <img className='icon-svg' src={process.env.PUBLIC_URL+"/icons/"+icon+(isOpen ? "-open" : "")+".svg"} />
}


export default Icon;


const folderIcons = {
    template: "folder-theme",
    view: "folder-views"
};
const fileIcons = {
    php: "php",
    css: "css",
    twig: "twig",
    json: "json",
    js: "javascript",
    gif: "image",
    png: "image",
    jpg: "image"
}