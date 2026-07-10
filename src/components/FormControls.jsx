import * as S from '../styles';
import { clamp, readableMoney } from '../utils';

export function Field({ label, children }) {
  return (
    <S.FieldWrap>
      <S.Label>{label}</S.Label>
      {children}
    </S.FieldWrap>
  );
}

export function Segment({ label, value, onChange, options }) {
  return (
    <S.ControlWrap>
      <S.Label>{label}</S.Label>
      <S.SegmentWrap>
        {options.map(([key, text]) => (
          <S.SegmentItem
            key={key}
            active={value === key}
            onClick={() => onChange(key)}
          >
            {text}
          </S.SegmentItem>
        ))}
      </S.SegmentWrap>
    </S.ControlWrap>
  );
}

export function ToggleRow({ icon, label, checked, onChange }) {
  return (
    <S.ToggleLine onClick={() => onChange(!checked)}>
      <span>
        {icon}
        {label}
      </span>
      <S.Switch checked={checked}>
        <i />
      </S.Switch>
    </S.ToggleLine>
  );
}

export function MoneyInput({ value, onChange, max = 100000000000 }) {
  return (
    <S.InputWithAssist>
      <S.TextInput
        inputMode="numeric"
        value={Number(value || 0).toLocaleString("ko-KR")}
        onChange={(e) =>
          onChange(clamp(e.target.value.replaceAll(",", ""), 0, max))
        }
      />
      <S.MoneyAssist>{readableMoney(value)}</S.MoneyAssist>
    </S.InputWithAssist>
  );
}

export function NumberInput({ value, onChange, suffix, min = "0" }) {
  return (
    <S.InlineNumber>
      <S.TextInput
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{suffix}</span>
    </S.InlineNumber>
  );
}

export function Metric({ label, value, wide = false }) {
  return (
    <S.MetricCard data-wide={wide ? "true" : undefined}>
      <span>{label}</span>
      <strong>{value}</strong>
    </S.MetricCard>
  );
}

export function PayRow({ title, desc, amount }) {
  return (
    <S.PayItem>
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      <b>{amount}</b>
    </S.PayItem>
  );
}
