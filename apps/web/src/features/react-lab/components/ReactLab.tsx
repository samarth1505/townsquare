import Actions19Demo from "./Actions19Demo";
import CompoundDemo from "./CompoundDemo";
import EffectsDemo from "./EffectsDemo";
import FormDemo from "./FormDemo";
import ModalDemo from "./ModalDemo";
import PatternsDemo from "./PatternsDemo";
import ReducerDemo from "./ReducerDemo";
import RefDemo from "./RefDemo";
import Section from "./Section";
import TransitionDemo from "./TransitionDemo";
import UseHookDemo from "./UseHookDemo";

// A reference page: one small, working demo for each core React topic. The code of each demo is commented in detail.
export default function ReactLab() {
  return (
    <div>
      <h1 className="mt-0">React lab</h1>
      <Section
        id="lab-reducer"
        title="useReducer"
        summary="Many related state changes handled by one pure function, driven by actions."
      >
        <ReducerDemo />
      </Section>
      <Section
        id="lab-transition"
        title="useTransition and useDeferredValue"
        summary="Keep typing responsive while a slow part of the screen catches up."
      >
        <TransitionDemo />
      </Section>
      <Section
        id="lab-effects"
        title="useLayoutEffect and useEffectEvent"
        summary="Fix layout before the first paint; read the latest values inside an effect without re-running it."
      >
        <EffectsDemo />
      </Section>
      <Section
        id="lab-portal"
        title="Portals"
        summary="Render into another place in the DOM while staying in the same place in the React tree."
      >
        <ModalDemo />
      </Section>
      <Section
        id="lab-refs"
        title="Refs as props and useImperativeHandle"
        summary="Let a parent call a small, deliberate API of a child instead of reaching into its DOM."
      >
        <RefDemo />
      </Section>
      <Section
        id="lab-compound"
        title="Compound components"
        summary="A family of components that share hidden state through Context."
      >
        <CompoundDemo />
      </Section>
      <Section
        id="lab-patterns"
        title="Hook vs render prop vs higher-order component"
        summary="Three generations of reusing logic. Today's answer is the custom hook."
      >
        <PatternsDemo />
      </Section>
      <Section
        id="lab-actions"
        title="React 19: form actions, useActionState, useFormStatus, useOptimistic"
        summary="Forms and optimistic updates without manual loading flags."
      >
        <Actions19Demo />
      </Section>
      <Section
        id="lab-use"
        title="React 19: use()"
        summary="Read a promise during render; Suspense shows the placeholder."
      >
        <UseHookDemo />
      </Section>
      <Section
        id="lab-forms"
        title="Forms with React Hook Form and Zod"
        summary="Schema-driven validation, accessible errors, uncontrolled inputs."
      >
        <FormDemo />
      </Section>
    </div>
  );
}
