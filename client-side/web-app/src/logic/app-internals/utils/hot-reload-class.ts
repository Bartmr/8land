type Prototype = { [key: string]: unknown };

type ModuleHotData = {
  previousPrototypes?: Map<string, Prototype>;
};

export function HotReloadClass(module: NodeModule): ClassDecorator {
  return (Target: Function) => {
    if (module.hot) {
      const targetName = Target.name;
      const targetPrototype = Target.prototype as Prototype;

      if (!targetName) {
        throw new Error();
      }

      let previousPrototypes: Map<string, Prototype>;

      const moduleHotData = module.hot.data as ModuleHotData;

      if (moduleHotData.previousPrototypes) {
        previousPrototypes = moduleHotData.previousPrototypes;
      } else {
        previousPrototypes = new Map<string, Prototype>();
      }

      module.hot.dispose((data: ModuleHotData) => {
        data.previousPrototypes = previousPrototypes;
      });

      const previousPrototype = previousPrototypes.get(targetName);

      if (previousPrototype) {
        Object.getOwnPropertyNames(targetPrototype).forEach((k) => {
          const value = targetPrototype[k];

          previousPrototype[k] = value;
        });
      }

      previousPrototypes.set(targetName, targetPrototype);
    }
  };
}
