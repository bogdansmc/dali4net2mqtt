ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

# Install requirements for add-on
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY run.sh ./
COPY lib ./lib
COPY build.sh ./
COPY index.js ./

RUN ./build.sh

CMD [ "/run.sh" ]

