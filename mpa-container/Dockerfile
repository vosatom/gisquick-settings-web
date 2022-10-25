FROM golang:1.18-alpine as builder
COPY ./main.go /go/src
RUN go build -ldflags="-s -w" -o /go/bin/copy-assets /go/src/main.go

FROM alpine:latest
# FROM gcr.io/distroless/static AS final
COPY --from=builder /go/bin/copy-assets /usr/local/bin/
