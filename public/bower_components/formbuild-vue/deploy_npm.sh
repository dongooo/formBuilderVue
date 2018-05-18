cd packages
cd ../survey-jquery
printf "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n" >> ./.npmrc
npm publish .
cd ../survey-react
printf "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n" >> ./.npmrc
npm publish .
cd ../survey-vue
printf "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n" >> ./.npmrc
npm publish .
