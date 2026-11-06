import Accordion from "./Accordion";

export default function CompoundDemo() {
  return (
    <Accordion>
      <Accordion.Item id="what">
        <Accordion.Trigger>What is a compound component?</Accordion.Trigger>
        <Accordion.Panel>
          Components that cooperate through shared Context, such as select and option.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="why">
        <Accordion.Trigger>Why not one component with many props?</Accordion.Trigger>
        <Accordion.Panel>
          The caller can place <em>any</em> content inside, and the component does not need a new
          prop for every variation.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
