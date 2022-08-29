import React, { useEffect, useRef } from 'react';
import { NFTStorage, File, Blob } from 'nft.storage';

interface IPFS_ERC721 {
  image: globalThis.Blob;
  name: string;
  description: string;
  properties: {
    category: 'Art' | 'Trading Cards';
    rotalty: number;
  };
}
const App2 = () => {
  useEffect(() => {}, []);

  const createIpfs = async () => {
    const NFT_STORAGE_TOKEN =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDVCYTE3ZkZGOTVBN0U0OTcyRUUzZDcwMjMyNWFBRjQ0ZTQzNjVDQTMiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MTQxNzUxOTQ2MCwibmFtZSI6Im1rcGFpb3oifQ.kbLuMD9PMYgLZSj8sj36Lel6FCDFeUQf59nVwQJUMnI';
    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });
    const img = new Blob([inputFile.current?.files ? inputFile.current?.files[0] : 'ssss']);
    const data: IPFS_ERC721 = {
      image: img,
      name: 'test',
      description: 'mo ta',
      properties: {
        category: 'Art',
        rotalty: 0,
      },
    };
    const cid = await client.store(data);
    console.log(cid);
  };
  const inputFile = useRef<HTMLInputElement>(null);
  console.log(inputFile.current);
  return (
    <div>
      App2
      <button onClick={createIpfs}>Create</button>
      <input
        ref={inputFile}
        type={'file'}
        onChange={() =>
          console.log(inputFile.current?.files ? inputFile.current?.files[0] : 'null')
        }
      ></input>
    </div>
  );
};

export default App2;
