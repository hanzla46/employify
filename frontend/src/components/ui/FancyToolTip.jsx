import * as Tooltip from "@radix-ui/react-tooltip";

export function FancyTooltip({ children, content }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className='bg-black text-white px-3 py-1 rounded-xl text-sm shadow-lg animate-fade-in' sideOffset={5}>
            {content}
            <Tooltip.Arrow className='fill-black' />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
