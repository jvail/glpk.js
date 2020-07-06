FROM emscripten/emsdk:1.39.18

USER 1000

WORKDIR /app

COPY . ./

CMD ["make", "all"]
