type Prototype = { [key: string]: unknown };

type ModuleHotData = {
  firstPrototypes?: Map<string, Prototype>;
};

export function HotReloadClass(module: NodeModule): ClassDecorator {
  return (Target: Function) => {
    if (module.hot) {
      const targetName = Target.name;
      const targetPrototype = Target.prototype as Prototype;

      if (!targetName) {
        throw new Error();
      }

      let firstPrototypes: Map<string, Prototype>;

      const moduleHotData = module.hot.data as ModuleHotData | undefined;

      if (moduleHotData?.firstPrototypes) {
        firstPrototypes = moduleHotData.firstPrototypes;
      } else {
        firstPrototypes = new Map<string, Prototype>();
      }

      module.hot.dispose((data: ModuleHotData) => {
        data.firstPrototypes = firstPrototypes;
      });

      const firstPrototype = firstPrototypes.get(targetName);

      if (firstPrototype) {
        Object.getOwnPropertyNames(targetPrototype).forEach((k) => {
          const value = targetPrototype[k];

          firstPrototype[k] = value;
        });
      } else {
        firstPrototypes.set(targetName, targetPrototype);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let overridenClass: any;

      // eslint-disable-next-line no-eval
      eval(`overridenClass = class ${targetName} extends Target {
        constructor(...args) {
          super(...args);
          if (!window.hotReloadedClassInstances) {
            window.hotReloadedClassInstances = {};
          }

          window.hotReloadedClassInstances[module.id] = [
            ...(window.hotReloadedClassInstances[module.id] || []),
            this,
          ];
        }
      };`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return overridenClass;
    }

    return undefined;
  };
}
