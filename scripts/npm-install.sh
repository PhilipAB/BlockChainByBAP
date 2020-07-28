#!/bin/bash
source /home/ec2-user/.bash_profile
cd /home/ec2-user/BlockChainByBAP
git pull origin develop
/home/ec2-user/.nvm/versions/node/v14.6.0/bin/npm install
