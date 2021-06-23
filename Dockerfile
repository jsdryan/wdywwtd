FROM node:latest
COPY ./ .
EXPOSE 5000
CMD ["npm", "start"]