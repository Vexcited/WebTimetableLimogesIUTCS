# Web Timetable for Limoges - IUT, Computer Science

## API

Publicly available at <https://edt-iut-info-limoges.vercel.app/api>, you'll find an
OpenAPI documentation at this entry point.

## Development

We're using `bun` as the main package manager.
Don't forget to install the dependencies using `bun install`.

Fill the `MONGODB_URI` environment variable in the `.env` file.
MongoDB is used to cache timetables to prevent requesting and extracting them too much.

| Command | Description |
| ------- | ----------- |
| `bun dev` | Starts the server on [`localhost:3000`](http://localhost:3000/). |
| `bun run build` | Build for production. |
