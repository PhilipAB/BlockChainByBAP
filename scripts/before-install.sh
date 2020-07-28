source /home/ec2-user/.bash_profile
sudo rm -rf /home/ec2-user/raw
sudo -H -u ec2-user bash -c '/home/ec2-user/.nvm/versions/node/v14.6.0/bin/pm2 delete all || :'