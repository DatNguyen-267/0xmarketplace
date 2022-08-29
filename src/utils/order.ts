export interface tokenERC20 {
  tokenAddress: string,
  amount: string,
  type: "ERC20"
}
export interface nft {
  tokenAddress: string,
  tokenId: string,
  type: "ERC20" | 'ERC721' | 'ERC1155'
}
const createAssetTokenERC20 = (tokenAddress: string, amount: string, type: "ERC20"): tokenERC20 => {
  const token: tokenERC20 = {
    tokenAddress,
    amount,
    type
  }
  return token;
}
const createAssetNFT = (tokenAddress: string, tokenId: string, type: "ERC20" | 'ERC721' | 'ERC1155'): nft => {
  const nft: nft = {
    tokenAddress,
    tokenId,
    type
  }
  return nft;
}
export {
  createAssetTokenERC20,
  createAssetNFT
}