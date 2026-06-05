import { Button } from "@/components/ui/Button";

type FormSuccessProps = {
  title: string;
  message: string;
  onReset?: () => void;
};

export function FormSuccess({ title, message, onReset }: FormSuccessProps) {
  return (
    <div className="border border-black/10 bg-white p-12 text-center sm:p-16">
      <p className="luxury-label mb-5 text-black">Submitted</p>
      <h2 className="luxury-heading text-3xl sm:text-4xl">{title}</h2>
      <p className="luxury-body mx-auto mt-8 max-w-md">{message}</p>
      {onReset && (
        <Button
          variant="outline"
          size="md"
          className="mt-12"
          onClick={onReset}
          type="button"
        >
          Submit Another
        </Button>
      )}
    </div>
  );
}
