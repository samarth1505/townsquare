import { createContext, useContext, useId, useMemo, useState, type ReactNode } from "react";

// A COMPOUND COMPONENT: a family of components that work together and share hidden state through Context.
//
//   <Accordion>
//     <Accordion.Item id="a">
//       <Accordion.Trigger>Question</Accordion.Trigger>
//       <Accordion.Panel>Answer</Accordion.Panel>
//     </Accordion.Item>
//   </Accordion>
//
// The alternative is one component with many props (items=[{title, body, ...}], renderTitle, panelClassName...) that
// keeps growing every time someone needs a variation. Here the CALLER controls the layout and can put anything
// inside a trigger or a panel; the component only owns the behaviour (which one is open, the ARIA wiring).

// `baseId` is ONE id made by the root and shared, so a trigger and its panel can build MATCHING ids from it.
// (If each part called useId() itself, they would get different ids and aria-controls would point at nothing.)
type AccordionContextValue = {
  baseId: string;
  openId: string | null;
  toggle: (id: string) => void;
};
const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext<string | null>(null);

function useAccordion(): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) throw new Error("Accordion parts must be rendered inside <Accordion>"); // fail loudly and clearly
  return context;
}

function useItemId(): string {
  const id = useContext(ItemContext);
  if (id === null)
    throw new Error("Accordion.Trigger and Accordion.Panel must be inside <Accordion.Item>");
  return id;
}

function Root({ children }: { children: ReactNode }) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null); // only one item open at a time
  // useMemo keeps `value` the same object between renders, so consumers re-render only when `openId` changes.
  const value = useMemo(
    () => ({
      baseId,
      openId,
      toggle: (id: string) => setOpenId((current) => (current === id ? null : id)),
    }),
    [baseId, openId],
  );
  // React 19: the context object can be rendered directly as the provider (no `.Provider`).
  return <AccordionContext value={value}>{children}</AccordionContext>;
}

function Item({ id, children }: { id: string; children: ReactNode }) {
  return <ItemContext value={id}>{children}</ItemContext>;
}

function Trigger({ children }: { children: ReactNode }) {
  const { baseId, openId, toggle } = useAccordion();
  const id = useItemId();
  return (
    <h3 className="m-0">
      <button
        type="button"
        id={`${baseId}-trigger-${id}`}
        aria-expanded={openId === id}
        aria-controls={`${baseId}-panel-${id}`}
        onClick={() => toggle(id)}
        className="flex w-full justify-between border-0 border-b border-app-border bg-transparent py-2 text-left font-semibold"
      >
        {children}
        <span aria-hidden="true">{openId === id ? "−" : "+"}</span>
      </button>
    </h3>
  );
}

function Panel({ children }: { children: ReactNode }) {
  const { baseId, openId } = useAccordion();
  const id = useItemId();
  return (
    <div
      id={`${baseId}-panel-${id}`}
      role="region"
      aria-labelledby={`${baseId}-trigger-${id}`}
      hidden={openId !== id}
      className="py-2 text-sm"
    >
      {children}
    </div>
  );
}

// Attach the parts as properties so they are used as <Accordion.Item>, and always imported together.
const Accordion = Object.assign(Root, { Item, Trigger, Panel });
export default Accordion;
