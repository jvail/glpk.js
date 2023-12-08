FROM emscripten/emsdk:2.0.34

RUN apt-get update && apt-get install --no-upgrade --no-install-recommends -y automake autoconf libtool

#USER 1000

WORKDIR /app

COPY . ./

CMD ["npm", "run", "build"]
