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

      const moduleHotData = module.hot.data as ModuleHotData | undefined;

      if (moduleHotData?.previousPrototypes) {
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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const overridenClass = class extends Target {
        constructor(...args: unknown[]) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          super(...args);
          if (!window.hotReloadedClassInstances) {
            window.hotReloadedClassInstances = {};
          }

          if (!window.hotReloadedClassInstances[module.id]) {
            window.hotReloadedClassInstances[module.id] = {};
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          window.hotReloadedClassInstances[module.id]![targetName] = [
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ...(window.hotReloadedClassInstances[module.id]![targetName] || []),
            this,
          ];
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
      return overridenClass as any;
    }

    return undefined;
  };
}
