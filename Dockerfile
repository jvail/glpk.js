FROM emscripten/emsdk:2.0.15

USER 1000

WORKDIR /app

COPY . ./

CMD ["make", "all"]
