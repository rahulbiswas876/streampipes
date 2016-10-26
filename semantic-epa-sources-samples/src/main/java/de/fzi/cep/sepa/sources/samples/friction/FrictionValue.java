package de.fzi.cep.sepa.sources.samples.friction;

/**
 * Created by riemer on 26.10.2016.
 */
public class FrictionValue {

    private double value;
    private double meanTemperature;

    public FrictionValue(double value, double meanTemperature) {
        this.value = value;
        this.meanTemperature = meanTemperature;
    }

    public FrictionValue() {

    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public double getMeanTemperature() {
        return meanTemperature;
    }

    public void setMeanTemperature(double meanTemperature) {
        this.meanTemperature = meanTemperature;
    }
}
