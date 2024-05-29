import MainCard from '../components/MainCard';
import { storageService } from '../services/storageService';
import { useEffect, useState } from 'react';
import FilesTable from '../sections/FilesTable';
import { v4 as uuid } from 'uuid';
import moment from "moment";
import { File } from '../services/storageService';

// ==============================|| UPLOAD PAGE ||============================== //

const UploadPage = () => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    storageService.listFiles()
      .then((resp: File[]) => {
        setFiles(resp);
      })
  }, []);

  const File = (id: string, name: string, size: number, mimetype: string) => 
  { return { name: name, id: id, metadata:{size: size, mimetype: mimetype}, created_at: moment().toDate().toISOString() } }


  const handleUpload = (event: any) => {

    const file = event.target.files[0];
    storageService.uploadFile(file)
      .then(() => {
        const fileObject: File = File(uuid(), file.name, file.size, file.type );
        setFiles([...files, fileObject]);
      })
      .catch(err => alert(err));
  }

  const handleDelete = (fName: string) => {
    storageService.removeFile(fName)
      .then(resp => {
        console.log(resp)
        setFiles(files.filter(f => f.name != fName));
      })
      .catch(err => alert(err));
  }

  return (
  <MainCard title="Upload/Delete Storage Files"> 
    <div>
      <input
        accept="*"
        id="contained-button-file"
        type="file"
        onChange={(e) => handleUpload(e)} 
      />
      <FilesTable fileList={files} onDelete={(fName: string) => handleDelete(fName)}/>
    </div>
  </MainCard>
  );
}

export default UploadPage;
