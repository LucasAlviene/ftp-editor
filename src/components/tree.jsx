import File from './file';

const Item = ({ data }) => {
  /*  if (data.type == "folder") return (
        <>
            {data.children.map((item) => <Item data={item} />)}
        </>
    );
*/
    return <File variant="tree" isEdit={data.isEdit} path={data.path} name={data.name} type={data.type}/>;

}

const Tree = ({ data }) => {
    return (
        <>
            {data.map((item,key) => <Item key={key} data={item} />)}
        </>
    )
}

export default Tree;