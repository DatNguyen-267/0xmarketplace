import { NftSwapV4, UserFacingERC20AssetDataSerializedV4 } from '@traderxyz/nft-swap-sdk';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { injected } from './connector';
import { nft_abi, nft_abi_aioz, address, nft_abi_1155 } from './nft';
// import { createAssetNFT, createAssetTokenERC20, nft } from './utils/order';

interface Nft {
  tokenId: string;
  owner: string;
  isSell: boolean;
  isBid: boolean;
}
interface Bid {
  tokenId: string;
  onwer: string;
}
function App() {
  const { activate, active, account, library, chainId } = useWeb3React();
  const [nfts, setNfts] = useState<Nft[]>();
  const [contract, setContract] = useState(null);
  const [nftSwapSdk, setNftSwapSdk] = useState<NftSwapV4>();
  const [signedOrders, setSignedOrders] = useState<any[]>([]);
  const [priceNft, setPriceNft] = useState<string>('');
  const [listBid, setListBid] = useState<Bid[]>([]);
  const [priceBid, setPriceBid] = useState<string>('');
  const [signedOrdersBid, setsignedOrdersBid] = useState<any[]>([]);

  useEffect(() => {
    getItemInMarket();
  }, [library]);
  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      console.log(isAuthorized);
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {});
      } else {
      }
    });
  }, []);
  useEffect(() => {
    if (library) {
      console.log(library)
      const nftSwapSdk = new NftSwapV4(library, library.getSigner(), chainId
      ,{
        appId: '314159',
        // zeroExExchangeProxyContractAddress: '0x9171b7e77a9d93a1a9e2534d233018ca2ef9e7ec',
        zeroExExchangeProxyContractAddress: address.address_0x, //0x aioz network
        orderbookRootUrl: 'https://api.trader.xyz',
      }
      );
      setNftSwapSdk(nftSwapSdk);
    }
  }, [library, chainId]);
  const reload = () => {
    getItemInMarket();
  };
  console.log(signedOrders);
  const getItemInMarket = async () => {
    if (library) {
      // const contract = new ethers.Contract(
      //   '0xbb8443fd4a2d1484bc678eadeea8e462f6e60bab',
      //   nft_abi_1155,
      //   library.getSigner()
      // );
      console.log(nftSwapSdk);
      const contract = new ethers.Contract(address.nft_address, nft_abi, library.getSigner());
      console.log(chainId);
      console.log(contract);
      const products = [1, 2,13,14,15 ];
      const getData = Promise.all(
        products.map(async (item, index) => {
          const owner: string = await contract.ownerOf(item);
          return {
            tokenId: item.toString(),
            owner,
            isSell: false,
            isBid: false,
          };
        })
      ).then((res) => {
        setNfts(res);
      });
      // const getData = await contract.uri('129639927665024025');

      // const json = await fetch(
      //   `https://ipfs.io/ipfs/bafyreih2cftt5t5wj44kn7wup7ua2gtvkdxi3gvepivzbgnilxm777dwny/metadata.json`
      // ).then((res) => res.json());
      // console.log(getData);
    }
  };
  const handleSell = async (_tokenId: string) => {
    if (nftSwapSdk && account) {
      const makerAddress = account;
      const assetNft: any = {
        tokenAddress: address.nft_address,
        tokenId: _tokenId,
        type: 'ERC721', // 'ERC721' or 'ERC1155'
      };
      const assetToken: UserFacingERC20AssetDataSerializedV4 = {
        tokenAddress: address.token_address, // WETH contract address
        amount: ethers.utils.parseEther(priceNft).toString(), // 420 Wrapped-ETH (WETH is 18 digits)
        type: 'ERC20',
      };
      try {
        if (makerAddress) {
          // Check require approve
          const approvalTx = await nftSwapSdk?.approveTokenOrNftByAsset(assetNft, makerAddress);
          const approvalTxReceipt = await approvalTx?.wait();
        }
        const order = nftSwapSdk.buildOrder(
          assetNft, // Maker asset to swap
          assetToken, // Taker asset to swap
          makerAddress
        );

        // Sign order so order is now fillable
        const newSignedOrder = await nftSwapSdk.signOrder(order);
        console.log(newSignedOrder);
        setSignedOrders([...signedOrders, newSignedOrder]);
        const index = nfts?.findIndex((item) => item.tokenId == _tokenId);
        if (nfts && index) nfts[index].isSell = true;
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleBuyNft = async (_tokenId: string, index: number) => {
    if (nftSwapSdk && account) {
      try {
        const makerAddress = account;
        const assetToken: any = {
          tokenAddress: address.token_address, // WETH contract address
          amount: signedOrders[index].erc20TokenAmount,
          type: 'ERC20',
        };
        if (makerAddress) {
          // Check require approve
          const approvalTx = await nftSwapSdk?.approveTokenOrNftByAsset(assetToken, makerAddress);
          const approvalTxReceipt = await approvalTx?.wait();
        }
        console.log(signedOrders[index]);
        const fillTx = await nftSwapSdk.fillSignedOrder(signedOrders[index]);
        console.log(fillTx);
        const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx.hash);
        const newSignedOrder = signedOrders.splice(index, 1);
        setSignedOrders(newSignedOrder);
        await reload();
      } catch (error) {
        console.log(error);
      }
    }
  };
  // console.log(account);
  const handleListBid = (_tokenId: string, _onwer: string) => {
    setListBid([...listBid, { tokenId: _tokenId, onwer: _onwer }]);
    const index = nfts?.findIndex((item) => item.tokenId == _tokenId);
    if (nfts && index) nfts[index].isBid = true;
  };
  const handleBid = async (_tokenId: string, index: Number) => {
    if (nftSwapSdk && account) {
      const makerAddress = account;
      const assetNft: any = {
        tokenAddress: address.nft_address,
        tokenId: _tokenId,
        type: 'ERC721', // 'ERC721' or 'ERC1155'
      };
      const assetToken: any = {
        tokenAddress: address.token_address, // WETH contract address
        amount: ethers.utils.parseEther(priceBid).toString(),
        type: 'ERC20',
      };
      try {
        if (makerAddress) {
          // Check require approve
          const approvalTx = await nftSwapSdk?.approveTokenOrNftByAsset(assetToken, makerAddress);
          const approvalTxReceipt = await approvalTx?.wait();
        }
        const order = nftSwapSdk.buildOrder(assetToken, assetNft, makerAddress);

        // Sign order so order is now fillable
        const newSignedOrder = await nftSwapSdk.signOrder(order);
        console.log(newSignedOrder);
        setsignedOrdersBid([...signedOrdersBid, newSignedOrder]);
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handleAcceptBid = async (_tokenId: string, index: number) => {
    if (nftSwapSdk && account) {
      try {
        const makerAddress = account;
        const assetNft: any = {
          tokenAddress: address.nft_address,
          tokenId: _tokenId,
          type: 'ERC721', // 'ERC721' or 'ERC1155'
        };
        if (makerAddress) {
          // Check require approve
          const approvalTx = await nftSwapSdk?.approveTokenOrNftByAsset(assetNft, makerAddress);
          const approvalTxReceipt = await approvalTx?.wait();
        }
        const fillTx = await nftSwapSdk.fillSignedOrder(signedOrdersBid[index]);
        const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx.hash);
        const newSignedOrder = signedOrdersBid.splice(index, 1);
        setsignedOrdersBid(newSignedOrder);
        await reload();
      } catch (error) {
        console.log(error);
      }
    }
  };
  // console.log(signedOrdersBid);
  return (
    <div className="App">
      <button onClick={() => activate(injected)}>{active ? 'Connected' : 'Connect'}</button>
      {/* List nft */}
      <div>
        <ul>
          {nfts &&
            nfts.map((item, index) => (
              <li key={index}>
                <b>ID: {item.tokenId}</b> <i>Owner: {item.owner}</i>
              </li>
            ))}
        </ul>
      </div>
      {/* Market */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
        <div>
          <span>Market</span>
          <div>
            {signedOrders &&
              account &&
              signedOrders.map((item, index) => {
                return (
                  <div key={index}>
                    {' '}
                    <b>ID: {item.erc721TokenId}</b> <i>Owner: {item.maker}</i>
                    <div>Price: {ethers.utils.formatEther(item.erc20TokenAmount)}</div>
                    {item.maker != account.toLowerCase() && (
                      <button onClick={() => handleBuyNft(item.erc721TokenId, index)}>Buy</button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
        <div>
          <p>MY NFT</p>
          <input
            type="text"
            placeholder="WETH"
            value={priceNft}
            onChange={(e) => setPriceNft(e.target.value)}
          ></input>
          <div>
            {nfts &&
              nfts.map((item, index) => {
                if (item.owner == account)
                  return (
                    <div key={index}>
                      {' '}
                      <b>ID: {item.tokenId}</b> <i>Owner: {item.owner}</i>
                      {!item.isSell ? (
                        <button onClick={() => handleSell(item.tokenId)}>Sell</button>
                      ) : (
                        <button>Selling </button>
                      )}
                      {!item.isBid ? (
                        <button onClick={() => handleListBid(item.tokenId, item.owner)}>Bid</button>
                      ) : (
                        <button>Bidding </button>
                      )}
                    </div>
                  );
              })}
          </div>
        </div>
      </div>
      <div>
        <h4>Bid</h4>
        <div>
          <input
            placeholder='Price bid "WETH"'
            value={priceBid}
            onChange={(e) => setPriceBid(e.target.value)}
          ></input>
          <ul>
            {listBid &&
              listBid.map((item, index) => {
                return (
                  <li>
                    Id: <b>{item.tokenId}</b> <span> {}</span>
                    Owner: {item.onwer}
                    {account?.toLowerCase() != item.onwer.toLowerCase() && (
                      <button onClick={() => handleBid(item.tokenId, index)}>Bid</button>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
        <div>
          <ul>
            {signedOrdersBid &&
              signedOrdersBid.map((item, index) => {
                return (
                  <li>
                    Id: <b>{item.erc721TokenId}</b> <span> {}</span>
                    price: {ethers.utils.formatEther(item.erc20TokenAmount)}
                    {account?.toLowerCase() == listBid[0].onwer.toLowerCase() && (
                      <button onClick={() => handleAcceptBid(item.tokenId, index)}>Accept</button>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
