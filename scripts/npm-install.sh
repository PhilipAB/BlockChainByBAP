#!/bin/bash
cd /home/ec2-user/BlockChainByBAP
git pull origin develop
sudo -H -u ec2-user bash -c 'npm install'
