// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {

    event newWave(address indexed from, string message, uint256 timestamp);
    event WonPrize(string message); 

    uint256 private seed;
    constructor() payable {
        console.log("Yo yo, I am a contract and I am smart");
        seed = (block.timestamp + block.difficulty);
    }

    uint256 totalWaves;

    mapping (address => uint256) public wavesBy;
    mapping (address => uint256) public lastWaveAt;

    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }

    Wave [] waves;

    function wave(string memory _message) public {
        // implementing a 2 minute cooldown
        require(
            lastWaveAt[msg.sender] + 2 minutes <= block.timestamp,
            "Wait for 2 minutes" 
        );
        lastWaveAt[msg.sender] = block.timestamp;
        totalWaves += 1;
        wavesBy[msg.sender] += 1;
        console.log("message from %s is %s", msg.sender, _message);
        console.log("%s has waved %d times now", msg.sender, wavesBy[msg.sender]);
        waves.push(Wave(msg.sender, _message, block.timestamp)); 
        emit newWave(msg.sender, _message, block.timestamp);
        //implementing the prize distribution here
        seed = (block.timestamp + block.difficulty + seed) % 100;
        console.log("Random seed generated: %d", seed);
        if(seed < 33) {   
            console.log("Address %s won 0.001 Eth!", msg.sender);
            uint256 prize = 0.001 ether;
            require(prize < address(this).balance, "amount not available in contract");
            (bool success,) = (msg.sender).call{value: prize}("");
            require(success, "Failed to withdraw money from contract");
            emit WonPrize("Congratulations you've won some Eth!");
        }
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total Waves", totalWaves);
        return totalWaves;
    }
}