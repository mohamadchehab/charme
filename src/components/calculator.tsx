import {
  Card,
  CardContent,
} from "@/components/ui/card";

type CalcProps = {
  result: number;
  expression: string;
  error?: string;
};

export const Calc = ({ result, expression, error }: CalcProps) => {
  return (
    <Card>
      <CardContent className="">
        <div className="flex flex-row justify-between items-center">
          <div>
            <div className="text-lg font-medium">{expression}</div>
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="text-3xl font-bold">{result}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
