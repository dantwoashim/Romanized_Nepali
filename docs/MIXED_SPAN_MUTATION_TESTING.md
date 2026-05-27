# Mixed Span Mutation Testing

The mixed-span mutation suite prevents a return to document-level blind spots.

Commands:

```bash
npm run generate:mixed-span-mutations
npm run benchmark:mixed-span-mutations
```

Fixture families:

- manual mixed Unicode + Preeti legacy islands
- manual Romanized mixed-office hostile cases
- generated mutations with protected tokens inserted around hard spans

Measured metrics:

- exact output rate
- action match rate
- protected preservation rate
- silent corruption rate
- per-suite breakdown

Generated mutation fixtures are regression pressure. They are not public real-world proof and are reported separately from manual or held-out suites.
