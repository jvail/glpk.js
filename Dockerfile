FROM emscripten/emsdk:1.39.18

WORKDIR /app

COPY . ./

CMD ["make", "all"]