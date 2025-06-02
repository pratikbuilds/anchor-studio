import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { IdlType } from "@/types/idl";
import { PublicKey } from "@solana/web3.js";

interface TypeInputProps {
  type: IdlType;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export function TypeInput({
  type,
  value,
  onChange,
  placeholder = "",
  className = "",
}: TypeInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d+$/.test(val)) {
      onChange(val === "" ? "" : Number(val));
    }
  };

  const handlePublicKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const pubkey = new PublicKey(e.target.value);
      onChange(pubkey.toString());
    } catch (err) {
      onChange(e.target.value);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onChange(checked);
  };

  const renderInput = () => {
    if (typeof type === 'string') {
      switch (type) {
        case 'bool':
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="boolean-checkbox"
                checked={!!value}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="boolean-checkbox">
                {value ? 'True' : 'False'}
              </Label>
            </div>
          );
        case 'publicKey':
          return (
            <Input
              type="text"
              value={value || ""}
              onChange={handlePublicKeyChange}
              placeholder={placeholder || "Enter public key..."}
              className={className}
            />
          );
        case 'u8':
        case 'i8':
        case 'u16':
        case 'i16':
        case 'u32':
        case 'i32':
        case 'u64':
        case 'i64':
        case 'u128':
        case 'i128':
        case 'u256':
        case 'i256':
          return (
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={value ?? ""}
              onChange={handleNumberChange}
              placeholder={placeholder || `Enter ${type} value...`}
              className={className}
            />
          );
        case 'f32':
        case 'f64':
          return (
            <Input
              type="number"
              step="any"
              value={value ?? ""}
              onChange={handleChange}
              placeholder={placeholder || `Enter ${type} value...`}
              className={className}
            />
          );
        case 'string':
          return (
            <Input
              type="text"
              value={value || ""}
              onChange={handleChange}
              placeholder={placeholder || "Enter text..."}
              className={className}
            />
          );
        default:
          return (
            <Input
              type="text"
              value={value || ""}
              onChange={handleChange}
              placeholder={placeholder || `Enter ${type}...`}
              className={className}
            />
          );
      }
    }

    // Handle complex types
    if (typeof type === 'object') {
      if ('option' in type || 'coption' in type) {
        const innerType = 'option' in type ? type.option : type.coption;
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-value"
                checked={value !== undefined && value !== null}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange('');
                  } else {
                    onChange(undefined);
                  }
                }}
              />
              <Label htmlFor="has-value">
                {value !== undefined && value !== null ? 'Has value' : 'No value'}
              </Label>
            </div>
            {value !== undefined && value !== null && (
              <div className="pl-6">
                <TypeInput
                  type={innerType}
                  value={value}
                  onChange={onChange}
                  placeholder={placeholder}
                  className={className}
                />
              </div>
            )}
          </div>
        );
      }

      if ('vec' in type || 'array' in type) {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Array Items</Label>
              <button
                type="button"
                onClick={() => {
                  const newArray = Array.isArray(value) ? [...value, ''] : [''];
                  onChange(newArray);
                }}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                + Add Item
              </button>
            </div>
            {Array.isArray(value) && value.length > 0 ? (
              <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                {value.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <TypeInput
                      type={'vec' in type ? type.vec : type.array[0]}
                      value={item}
                      onChange={(newValue) => {
                        const newArray = [...value];
                        newArray[index] = newValue;
                        onChange(newArray);
                      }}
                      placeholder={`Item ${index + 1}`}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newArray = value.filter((_, i) => i !== index);
                        onChange(newArray);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No items added yet</p>
            )}
          </div>
        );
      }

      if ('defined' in type) {
        // For custom types, we'll just use a JSON input
        return (
          <div className="space-y-2">
            <Label>{type.defined}</Label>
            <textarea
              value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange(parsed);
                } catch {
                  onChange(e.target.value);
                }
              }}
              placeholder={`Enter ${type.defined} as JSON...`}
              className="w-full min-h-[100px] p-2 border rounded-md font-mono text-sm"
            />
          </div>
        );
      }
    }

    // Fallback for any unhandled types
    return (
      <Input
        type="text"
        value={value || ""}
        onChange={handleChange}
        placeholder={placeholder || "Enter value..."}
        className={className}
      />
    );
  };

  return <div className="w-full">{renderInput()}</div>;
}
