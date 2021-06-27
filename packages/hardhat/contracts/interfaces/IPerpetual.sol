// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IPerpetual {


function getReserveAssets() public view returns (address[] memory);

function getPoolInfo() public view returns (PerpetualTypes.Pool memory);

function getEUROracle() public view returns (address);

function getAssetracle(address _asset) public view returns (address);

/// @notice Gets an asset price by address
/// @param _oracleAddress The address of the chainlink oracle
/// @dev fallBackPrice
function getAssetPrice(address _oracleAddress) public view returns (uint256) {
    (, int256 price, , uint256 timeStamp, ) = AggregatorV3Interface(
        _oracleAddress
    ).latestRoundData();
    // If the round is not complete yet, timestamp is 0
    require(timeStamp > 0, "Round not complete");
    require(price > 0, "Integer conversion failed");
    return uint256(price);
}

/************************* USER VIEWS *************************/

/// @notice Returns user balance of a given reserve tokens
/// @param account user address
/// @param _token token address
function getReserveBalance(address account, address _token)
    public
    view
    returns (uint256)
{
    return balances[account].userReserve[_token];
}

/// @notice Returns user long balance
/// @param account user address
function getLongBalance(address account) public view returns (uint256) {
    return balances[account].EURUSDlong;
}

/// @notice Returns user short balance
/// @param account user address
function getShortBalance(address account) public view returns (uint256) {
    return balances[account].EURUSDshort;
}

/// @notice Returns user USD notional
/// @param account user address
function getUserNotional(address account) public view returns (uint256) {
    return balances[account].usdNotional;
}

/// @notice Returns reserve value of a given trader
/// @dev Ignore ETH value for now
function getPortfolioValue(address account) public view returns (uint256) {
    uint256 portfolioValue;
    for (uint256 i = 0; i < _TOKENS_.length; i++) {
        address tokenAddress = _TOKENS_[i];
        portfolioValue += _assetValue(account, tokenAddress);
    }
    return portfolioValue;
}

// @notice Calculates the value of token for user
function _assetValue(address account, address token)
    public
    view
    returns (uint256)
{
    address oracleAddress = assetOracles[token];
    uint256 tokenValue = getReserveBalance(account, token) *
        getAssetPrice(oracleAddress);
    return tokenValue;
}

/// @notice Computes the unrealized PnL
/// @return unrealized PnL
/// @dev to be implemented
function getUnrealizedPnL() public pure returns (uint256) {
    return uint256(0);
}

/// @notice Returns information about the margin ratio of a account
/// @param account Address of account
/// @return Margin ratio of account w/ 18 decimals

function getUserMarginRatio(address account) public view returns (uint256) {
    return
        _marginRatio(
            getPortfolioValue(account),
            getUnrealizedPnL(),
            getUserNotional(account)
        );
}

function _marginRatio(
    uint256 margin,
    uint256 unrealizedPnL,
    uint256 notionalValue
) internal pure returns (uint256) {
    //console.log("Margin is", margin);
    //console.log("unrealizedPnL is", unrealizedPnL);
    //console.log("notionalValue is", notionalValue);
    return ((margin + unrealizedPnL) * 10**18) / notionalValue;
}
