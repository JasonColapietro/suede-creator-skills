# Suede AI Skills MCP: a dependency-free stdio MCP server.
# Build:  docker build -t suede-skills-mcp .
# Run:    docker run -i --rm suede-skills-mcp
# Set SUEDE_MCP_OFFLINE=1 to turn off the live page audit, the only tool that
# fetches the web.
FROM node:22-alpine

WORKDIR /app
COPY mcp/ ./mcp/
COPY skills/ ./skills/

USER node
ENTRYPOINT ["node", "mcp/suede-skills-mcp.mjs"]
CMD ["--profile", "all"]
