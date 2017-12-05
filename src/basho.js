#!/usr/bin/env node

import "babel-polyfill";
import getStdin from "get-stdin";
import { Seq } from "lazily-async";
import { parse, PipelineError } from "./parse";
import haikus from "./haikus";

export default parse;

if (require.main == module) {
  if (process.argv.length > 2) {
    if (process.argv[2] === "-v" || process.argv[2] === "--version") {
      const packageJSON = require("../package.json");
      console.log(packageJSON.version);
      process.exit(0);
    } else {
      getStdin()
        .then(async str => {
          const input = str
            .replace(/\n$/, "")
            .split("\n")
            .filter(x => x !== "");
          const output = await parse(
            input.concat(process.argv.slice(2)),
            undefined,
            [],
            true,
            true,
            x => console.log(x),
            x => process.stdout.write(x.toString())
          );
          if (output.mustPrint) {
            for await (const item of output.result) {
              if (item instanceof PipelineError) {
                console.log(item.message);
                throw item.error;
              }
              console.log(item);
            }
          }
          process.exit(0);
        })
        .catch(error => {
          console.log(error.message);
          process.exit(1);
        });
    }
  } else {
    const haiku = haikus[parseInt(Math.random() * haikus.length)];
    console.log(`${haiku.text}\n -${haiku.author}`);
  }
}
